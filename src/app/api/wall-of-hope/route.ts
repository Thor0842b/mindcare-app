import { NextRequest, NextResponse } from "next/server";
import { getWallPosts, createWallPost, deleteWallPost } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const posts = getWallPosts();
  return NextResponse.json({ posts }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { message } = await request.json();
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const post = createWallPost(message.trim());
  return NextResponse.json({ post }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  deleteWallPost(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
