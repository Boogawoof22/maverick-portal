import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId, score, totalQuestions } = await req.json();
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: (session.user as any).id,
      score,
      totalQuestions,
      answers: "[]",
    },
  });
  return NextResponse.json(attempt);
}
