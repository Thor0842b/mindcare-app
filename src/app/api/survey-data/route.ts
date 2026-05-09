import { NextRequest, NextResponse } from "next/server";
import { getSurveyData, clearSurveyData as clearData, addSurveyData, deleteSurveyData } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { SurveyChartData } from "@/lib/types";

export async function GET() {
  const data = getSurveyData();
  return NextResponse.json({ charts: data }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const chart: SurveyChartData = {
    id: `s${Date.now()}`,
    type: body.type,
    title: body.title,
    labels: body.labels,
    values: body.values,
    createdAt: new Date().toISOString(),
  };

  addSurveyData(chart);
  return NextResponse.json({ chart }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    deleteSurveyData(id);
    return NextResponse.json({ success: true }, { status: 200 });
  }

  clearData();
  return NextResponse.json({ success: true }, { status: 200 });
}
