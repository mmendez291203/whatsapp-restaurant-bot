import Anthropic from "@anthropic-ai/sdk";
import type { RestaurantConfigData, ReservationData } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIResponse {
  message: string;
  shouldEscalate: boolean;
  reservation: ReservationData;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(
  config: RestaurantConfigData,
  reservation: ReservationData
): string {
  const hoursText = Object.entries(config.hours)
    .map(([day, hours]) =>
      hours ? `${day}: ${hours.open} - ${hours.close}` : `${day}: cerrado`
    )
    .join("\n");

  const menuText = config.menu
    .map((item) => `- ${item.name} ($${item.price}): ${item.description}`)
    .join("\n");

  const faqsText = config.faqs
    .map((faq) => `P: ${faq.question}\nR: ${faq.answer}`)
    .join("\n\n");

  const reservationStatus = `
Datos de reserva recopilados hasta ahora:
- Nombre: ${reservation.guestName ?? "pendiente"}
- Fecha: ${reservation.date ?? "pendiente"}
- Hora: ${reservation.time ?? "pendiente"}
- Personas: ${reservation.partySize ?? "pendiente"}
`;

  return `Eres el asistente virtual de ${config.name}, un restaurante.
Respondés siempre en el mismo idioma que el cliente.
Sos amable, conciso y útil.

INFORMACIÓN DEL RESTAURANTE:
Dirección: ${config.address}
Teléfono: ${config.phone}

HORARIOS:
${hoursText}

MENÚ:
${menuText}

PREGUNTAS FRECUENTES:
${faqsText}

RESERVAS:
${reservationStatus}
Para completar una reserva necesitás: nombre completo, fecha, hora y número de personas.
Pedí los datos que faltan de a uno por vez, de forma natural.
Cuando tengas todos los datos, confirmá la reserva con un resumen.

INSTRUCCIÓN IMPORTANTE:
Respondé SIEMPRE con este JSON exacto, sin texto adicional:
{
  "message": "tu respuesta al cliente aquí",
  "shouldEscalate": false,
  "reservation": {
    "guestName": null,
    "date": null,
    "time": null,
    "partySize": null
  }
}

- En "message": lo que le decís al cliente
- En "shouldEscalate": true SOLO si la pregunta está fuera de tu conocimiento o el cliente pide hablar con una persona
- En "reservation": completá los campos que el cliente haya mencionado, mantené null los que falten
`;
}

export async function getAIResponse(
  history: ConversationMessage[],
  newMessage: string,
  config: RestaurantConfigData,
  reservation: ReservationData
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(config, reservation);

  const messages = [
    ...history,
    { role: "user" as const, content: newMessage },
  ];

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as AIResponse;
    return parsed;
  } catch {
    return {
      message: cleaned,
      shouldEscalate: false,
      reservation,
    };
  }
}