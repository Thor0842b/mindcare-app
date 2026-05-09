import { NextRequest, NextResponse } from "next/server";
import { getFinances, createFinance, deleteFinance } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const entries = getFinances(session.userId);
  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  if (!body.amount || !body.type) return NextResponse.json({ error: "Amount and type required" }, { status: 400 });
  const entry = createFinance(session.userId, {
    type: body.type,
    category: body.category || "Other",
    amount: Number(body.amount),
    note: body.note || "",
    date: body.date || new Date().toISOString().split("T")[0],
  });
  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteFinance(id, session.userId);
  return NextResponse.json({ success: true }, { status: 200 });
}
