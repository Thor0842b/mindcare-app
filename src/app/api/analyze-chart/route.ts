import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const chartType = (formData.get("type") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const groq = new Groq({ apiKey });

    const prompt = `This image contains one or more survey charts (bar graphs, pie charts, line charts).
Extract ALL charts visible in this image. For each chart, identify its type, title, labels, and values.

Return ONLY valid JSON — an object with a "charts" array. Each chart must follow this structure:
{
  "charts": [
    {
      "type": "bar" | "pie" | "line",
      "title": "descriptive title of the chart",
      "labels": ["label1", "label2", ...],
      "values": [number1, number2, ...]
    }
  ]
}

If there are multiple charts in the image, include ALL of them in the array.
Do not include any other text or explanation — ONLY the JSON object.`;

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse chart data from image", raw: text },
        { status: 422 }
      );
    }

    const charts = Array.isArray(result.charts) ? result.charts : (result.chart ? [result.chart] : [result]);

    if (charts.length === 0) {
      return NextResponse.json(
        { error: "No charts found in image", raw: result },
        { status: 422 }
      );
    }

    return NextResponse.json({ charts }, { status: 200 });
  } catch (error: any) {
    console.error("/api/analyze-chart error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
