import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const atHome = searchParams.get("atHome");

  const where: any = {};
  if (category) where.category = category;
  if (atHome === "true") where.atHome = true;

  const drills = await prisma.drillLibrary.findMany({ where, orderBy: { title: "asc" } });
  return NextResponse.json(drills);
}
