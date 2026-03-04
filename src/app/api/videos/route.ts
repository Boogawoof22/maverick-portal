import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const position = searchParams.get("position");

  const where: any = {};
  if (category) where.category = category;
  if (position) where.position = position;

  const videos = await prisma.video.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(videos);
}
