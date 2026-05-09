"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Send, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const FALLBACKS = [
  "That sounds challenging. Have you tried box breathing? Inhale 4 counts, hold 4, exhale 4, hold 4. It helps calm the nervous system.",
  "Thank you for sharing that. Journaling can be a helpful way to untangle your thoughts — just 5 minutes can make a difference.",
  "I hear you. Remember, it's okay not to be okay. What's one small thing you can do for yourself today?",
  "That's a great perspective! Celebrating small wins builds momentum. What else is going well for you?",
  "Feeling overwhelmed is completely normal. Try grounding yourself with the 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
  "Thanks for telling me how you feel. Your feelings are valid. Would talking to a campus counselor help? I can share resources.",
  "That's wonderful to hear! Positive energy can be contagious. Keep nurturing what brings you joy.",
  "Rest is productive too. Make sure you're giving yourself permission to recharge without guilt.",
  "You're showing a lot of strength by reaching out. Speaking with someone you trust can lighten the load.",
  "Progress, not perfection. You're doing better than you think. Want to explore some mindfulness exercises?",
];

function getCannedReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (/\b(self.?harm|suicide|kill myself|end my life|want to die)\b/.test(lower)) {
    return "EMERGENCY_TRIGGER_ACTIVATED: I am so sorry you are in pain. Please use the emergency contacts on your screen right now.";
  }
  if (/\b(anxious|anxiety|worried|panic|nervous|stressed)\b/.test(lower)) {
    return "Anxiety can feel overwhelming. Try this: breathe in slowly for 4 seconds, hold for 4, and exhale for 4. Do that 3 times. How do you feel now?";
  }
  if (/\b(sad|depress|low|down|cry|crying|unhappy)\b/.test(lower)) {
    return "I'm sorry you're feeling this way. It's okay to sit with sadness — it's a valid emotion. Is there someone you trust you can talk to today?";
  }
  if (/\b(angry|mad|frustrated|irritat|annoyed)\b/.test(lower)) {
    return "Anger is a signal that something matters to you. Take a moment to step back and breathe. What triggered this feeling?";
  }
  if (/\b(thank|thanks|grateful|appreciate)\b/.test(lower)) {
    return "You're welcome! Gratitude is a powerful practice. Want to try naming three things you're grateful for today?";
  }
  if (/\b(sleep|tired|exhaust|insomnia|can't sleep)\b/.test(lower)) {
    return "Sleep is essential for mental health. Try a calming bedtime routine: dim lights, no screens 30 min before bed, and some light stretching. Does that sound doable?";
  }
  if (/\b(hello|hi|hey|good morning|good evening)\b/.test(lower)) {
    return "Hi there! I'm glad you're here. How are you feeling today — take your time, I'm listening.";
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

function showEmergencyToast() {
  toast(
    "24/7 Care: 1800-123-4567 | Email: campus-support@mentalhealth.edu\nHelp is always available.",
    {
      duration: 12000,
      icon: "🆘",
      style: {
        background: "#fff7ed",
        color: "#9a3412",
        border: "1px solid #fed7aa",
        borderRadius: "16px",
        whiteSpace: "pre-line",
        fontSize: "13px",
      },
    }
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "0",
      text: "Hi there! I'm MindCare, your wellness companion. How are you feeling today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now().toString(), text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.isBot ? "bot" : "user",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: text }] }),
      });

      const data = await res.json();
      let reply = data.reply || "...";

      if (reply.includes("EMERGENCY_TRIGGER_ACTIVATED")) {
        showEmergencyToast();
        reply =
          "I'm really glad you reached out. Please use the emergency contacts on your screen right now — trained counselors are available 24/7. You are not alone.";
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), text: reply, isBot: true }]);
    } catch (err: any) {
      console.error("Chatbot error:", err);
      const fallbackReply = getCannedReply(text);
      if (fallbackReply.includes("EMERGENCY_TRIGGER_ACTIVATED")) {
        showEmergencyToast();
      }
      const msg = fallbackReply.includes("EMERGENCY_TRIGGER_ACTIVATED")
        ? "I'm really glad you reached out. Please use the emergency contacts on your screen right now — trained counselors are available 24/7. You are not alone."
        : fallbackReply;
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: msg, isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-sage to-emerald-500 p-4 text-white">
              <div>
                <h3 className="font-semibold text-sm">MindCare</h3>
                <p className="text-xs text-white/80">Your wellness companion</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background"
              style={{ maxHeight: "350px" }}
              ref={scrollRef}
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      m.isBot
                        ? "bg-mint text-slate rounded-bl-sm"
                        : "bg-sky text-white rounded-br-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-mint text-slate rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 space-y-3">
              <button
                onClick={showEmergencyToast}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Get Help - 24/7 Care
              </button>
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sage transition-colors disabled:opacity-50"
                />
                <button
                  disabled={isTyping}
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
