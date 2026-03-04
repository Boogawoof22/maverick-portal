import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const cards = await prisma.flashcard.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { front, back, category } = await req.json();
  const card = await prisma.flashcard.create({
    data: { front, back, category, userId: (session.user as any).id },
  });
  return NextResponse.json(card);
}
