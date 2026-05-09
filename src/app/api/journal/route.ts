import { NextResponse } from "next/server";
import { getJournalEntries, createJournalEntry } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const entries = getJournalEntries(session.userId);
  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { prompt, content } = await request.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const entry = createJournalEntry(session.userId, prompt || "", content.trim());
  return NextResponse.json({ entry }, { status: 201 });
}
