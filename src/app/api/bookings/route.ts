import { NextRequest, NextResponse } from "next/server";
import { createBooking, getBookings, getBookingByToken, updateBooking, deleteBooking } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateToken } from "@/lib/token";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const booking = getBookingByToken(token);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ booking }, { status: 200 });
  }

  const bookings = getBookings();
  return NextResponse.json({ bookings }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { date, time, counselor } = await request.json();

    if (!date || !time || !counselor) {
      return NextResponse.json(
        { error: "date, time, and counselor are required" },
        { status: 400 }
      );
    }

    const token = generateToken();
    const booking = createBooking(date, time, counselor, token);

    return NextResponse.json({ booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const booking = updateBooking(id, body);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ booking }, { status: 200 });
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
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  deleteBooking(id);
  return NextResponse.json({ success: true }, { status: 200 });
}
