import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const config = await db.restaurantConfig.findFirst();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const existing = await db.restaurantConfig.findFirst();

  if (existing) {
    const updated = await db.restaurantConfig.update({
      where: { id: existing.id },
      data: body,
    });
    return NextResponse.json(updated);
  }

  const created = await db.restaurantConfig.create({ data: body });
  return NextResponse.json(created);
}