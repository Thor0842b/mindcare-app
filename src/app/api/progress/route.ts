import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createProgress, getProgressByUser, getStudents } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resourceId } = await request.json();

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    createProgress(session.userId, resourceId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "admin") {
    const students = getStudents();
    return NextResponse.json({ students }, { status: 200 });
  }

  const progress = getProgressByUser(session.userId);
  return NextResponse.json({ progress }, { status: 200 });
}
