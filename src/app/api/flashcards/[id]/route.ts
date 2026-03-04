import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { mastered } = await req.json();
  const card = await prisma.flashcard.update({
    where: { id },
    data: { mastered, lastReviewed: new Date() },
  });
  return NextResponse.json(card);
}
