import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/auth";
import { getUserById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = getUserById(session.userId);
  if (!user) {
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.set(clearSessionCookie());
    return response;
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastActive: user.lastActive,
        modulesCompleted: user.modulesCompleted,
      },
    },
    { status: 200 }
  );
}

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set(clearSessionCookie());
  return response;
}
