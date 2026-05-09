import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { feeling } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });

    const groq = new Groq({ apiKey });

    const prompt = feeling
      ? `The user says they are feeling: "${feeling}". Generate a single, warm, encouraging positive affirmation tailored to this feeling. Keep it 1-2 sentences. Do not use quotes or prefixes.`
      : `Generate a single, warm, encouraging positive affirmation for someone who needs a boost. Keep it 1-2 sentences. Do not use quotes or prefixes.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 150,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "You are stronger than you know.";
    return NextResponse.json({ affirmation: text }, { status: 200 });
  } catch (error: any) {
    console.error("/api/affirmation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate affirmation" }, { status: 500 });
  }
}
