import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json([], { status: 401 });
  const user = session.user as any;
  const isCoach = user.role === "coach" || user.role === "admin";

  const assignments = await prisma.assignment.findMany({
    where: isCoach ? { coachId: user.id } : { playerId: user.id },
    include: { player: { select: { name: true, position: true } }, coach: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, type, playerId, dueDate } = await req.json();
  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      type,
      playerId,
      coachId: (session.user as any).id,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return NextResponse.json(assignment);
}
