import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT =
  "You are 'MindCare', an empathetic, non-judgmental digital mental health assistant for university students. Keep responses concise, conversational, and warm. Suggest practical grounding techniques (like breathing or journaling) for stress. CRITICAL RULE: If the user mentions self-harm, extreme depression, or violence, you must immediately reply with exactly: 'EMERGENCY_TRIGGER_ACTIVATED: I am so sorry you are in pain. Please use the emergency contacts on your screen right now.' Do not generate any other text.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("/api/chat: GROQ_API_KEY is not set in .env.local");
      return NextResponse.json(
        {
          reply:
            "I'm sorry, the AI service is not configured. Please set GROQ_API_KEY in your .env.local file.",
        },
        { status: 200 }
      );
    }

    const groq = new Groq({ apiKey });

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "...";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("/api/chat: Groq API call failed —", error);
    return NextResponse.json(
      {
        reply:
          "I'm having trouble connecting right now. Please try again in a moment. Remember, you can always reach out to 24/7 Care at 1800-123-4567.",
      },
      { status: 200 }
    );
  }
}
