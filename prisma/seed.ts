import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

async function main() {
  process.loadEnvFile(__dirname + "/../.env");

  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!);
  const db = new PrismaClient({ adapter });

  await db.restaurantConfig.deleteMany();

  await db.restaurantConfig.create({
    data: {
      name: "La Trattoria",
      address: "Av. Corrientes 1234, Buenos Aires",
      phone: "+54 11 4567-8900",
      hours: {
        lunes: null,
        martes: { open: "12:00", close: "23:00" },
        miércoles: { open: "12:00", close: "23:00" },
        jueves: { open: "12:00", close: "23:00" },
        viernes: { open: "12:00", close: "00:00" },
        sábado: { open: "12:00", close: "00:00" },
        domingo: { open: "12:00", close: "22:00" },
      },
      menu: [
        { name: "Pasta Carbonara", description: "Pasta con panceta, huevo y parmesano", price: 1800, category: "Pastas" },
        { name: "Risotto de hongos", description: "Arroz cremoso con hongos salteados", price: 2100, category: "Risottos" },
        { name: "Tiramisú", description: "Clásico postre italiano con mascarpone", price: 900, category: "Postres" },
        { name: "Vino Malbec", description: "Copa de Malbec Mendoza", price: 800, category: "Bebidas" },
      ],
      faqs: [
        { question: "¿Tienen estacionamiento?", answer: "No tenemos estacionamiento propio, pero hay un parking a media cuadra en Corrientes 1290." },
        { question: "¿Aceptan mascotas?", answer: "Aceptamos mascotas en la terraza exterior." },
        { question: "¿Tienen opciones vegetarianas?", answer: "Sí, el risotto de hongos y varias pastas pueden hacerse vegetarianas." },
      ],
    },
  });

  console.log("Restaurante cargado correctamente");
  await db.$disconnect();
}

main().catch(console.error);
