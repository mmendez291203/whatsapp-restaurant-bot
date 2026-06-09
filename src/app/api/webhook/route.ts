import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAIResponse } from "@/lib/claude";
import { sendWhatsAppMessage } from "@/lib/twilio";
import type { RestaurantConfigData, ReservationData } from "@/types";

const twilioSchema = z.object({
  From: z.string(),
  To: z.string(),
  Body: z.string(),
  MessageSid: z.string(),
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = Object.fromEntries(formData.entries());

  const parsed = twilioSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { From, Body } = parsed.data;
  const phoneNumber = From.replace("whatsapp:", "");

  const config = await db.restaurantConfig.findFirst();
  if (!config) {
    await sendWhatsAppMessage(phoneNumber, "El restaurante no está configurado aún.");
    return new NextResponse(null, { status: 200 });
  }

  let conversation = await db.conversation.findFirst({
    where: { phoneNumber, status: "active" },
    include: { messages: { orderBy: { createdAt: "asc" } }, reservation: true },
  });

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (conversation && conversation.updatedAt < twentyFourHoursAgo) {
    await db.conversation.update({
      where: { id: conversation.id },
      data: { status: "closed" },
    });
    conversation = null;
  }

  if (!conversation) {
    const created = await db.conversation.create({
      data: { phoneNumber },
    });
    conversation = await db.conversation.findUnique({
      where: { id: created.id },
      include: { messages: { orderBy: { createdAt: "asc" } }, reservation: true },
    });
    if (!conversation) return new NextResponse(null, { status: 500 });
  }

  await db.message.create({
    data: { conversationId: conversation.id, role: "user", content: Body },
  });

  await db.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  const history = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const currentReservation: ReservationData = conversation.reservation
    ? {
        guestName: conversation.reservation.guestName,
        date: conversation.reservation.date,
        time: conversation.reservation.time,
        partySize: conversation.reservation.partySize,
      }
    : { guestName: null, date: null, time: null, partySize: null };

  const aiResponse = await getAIResponse(
    history,
    Body,
    config as unknown as RestaurantConfigData,
    currentReservation
  );

  await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: aiResponse.message,
    },
  });

  if (aiResponse.shouldEscalate) {
    await db.conversation.update({
      where: { id: conversation.id },
      data: { status: "escalated" },
    });
  }

  const r = aiResponse.reservation;
  const reservationComplete =
    r.guestName && r.date && r.time && r.partySize;

  if (reservationComplete) {
    await db.reservation.upsert({
      where: { conversationId: conversation.id },
      create: {
        conversationId: conversation.id,
        phoneNumber,
        guestName: r.guestName!,
        date: r.date!,
        time: r.time!,
        partySize: r.partySize!,
      },
      update: {
        guestName: r.guestName!,
        date: r.date!,
        time: r.time!,
        partySize: r.partySize!,
      },
    });
  }

  await sendWhatsAppMessage(phoneNumber, aiResponse.message);

  return new NextResponse(null, { status: 200 });
}