import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assignment = await prisma.assignment.update({
    where: { id },
    data: { completed: true, completedAt: new Date() },
  });
  return NextResponse.json(assignment);
}
