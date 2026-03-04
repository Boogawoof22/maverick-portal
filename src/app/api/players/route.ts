import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const players = await prisma.user.findMany({
    where: { role: "player" },
    select: { id: true, name: true, position: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(players);
}
