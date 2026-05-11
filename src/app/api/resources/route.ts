import { NextRequest, NextResponse } from "next/server";
import { getResources, createResource, reorderResources, deleteResource } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const resources = getResources();
  return NextResponse.json({ resources }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, category, url, audioUrl, body } = await request.json();

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    if (!["Video", "Audio", "Article"].includes(category)) {
      return NextResponse.json(
        { error: "Category must be Video, Audio, or Article" },
        { status: 400 }
      );
    }

    if (!url && !audioUrl && !body) {
      return NextResponse.json(
        { error: "URL, audio file, or article body is required" },
        { status: 400 }
      );
    }

    const resource = createResource(title, category, url || "", audioUrl, body);
    return NextResponse.json({ resource }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
    }
    const resources = reorderResources(orderedIds);
    return NextResponse.json({ resources }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
  }

  const deleted = deleteResource(id);
  if (!deleted) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
