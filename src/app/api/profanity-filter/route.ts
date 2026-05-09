import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ safe: true }, { status: 200 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ safe: true }, { status: 200 });

    const groq = new Groq({ apiKey });

    const prompt = `Analyze this message for bullying, harassment, hate speech, or toxic content. Reply with ONLY a JSON object: {"flagged": true/false, "reason": "short explanation or empty string"}. Do not include any other text.

Message: "${message}"`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 100,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || '{"flagged":false,"reason":""}';
    const match = text.match(/\{[\s\S]*\}/);
    const result = JSON.parse(match ? match[0] : text);

    return NextResponse.json({
      safe: !result.flagged,
      reason: result.flagged ? result.reason : null,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ safe: true }, { status: 200 });
  }
}
