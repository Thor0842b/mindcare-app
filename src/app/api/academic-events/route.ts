import { NextRequest, NextResponse } from "next/server";
import { getAcademicEvents, createAcademicEvent, deleteAcademicEvent } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const events = getAcademicEvents(session.userId);
  return NextResponse.json({ events }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json();
  if (!body.title || !body.start) return NextResponse.json({ error: "Title and start date required" }, { status: 400 });
  const event = createAcademicEvent(session.userId, {
    title: body.title,
    start: body.start,
    end: body.end,
    type: body.type || "other",
  });
  return NextResponse.json({ event }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteAcademicEvent(id, session.userId);
  return NextResponse.json({ success: true }, { status: 200 });
}
