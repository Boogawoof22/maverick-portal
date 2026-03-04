import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "defense";
  const items = await prisma.playbook.findMany({
    where: { category },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(items);
}
