import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quizzes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, category, difficulty, questions } = await req.json();
  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      category,
      difficulty,
      createdBy: (session.user as any).id,
      isPublished: true,
      questions: {
        create: questions.map((q: any, i: number) => ({
          type: "multiple_choice",
          text: q.text,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          sortOrder: i,
        })),
      },
    },
  });
  return NextResponse.json(quiz);
}
