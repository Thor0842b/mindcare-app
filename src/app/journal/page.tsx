"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookHeart, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import { JournalEntry } from "@/lib/types";
import toast from "react-hot-toast";

const PROMPTS = [
  "What are 3 things that made you smile today?",
  "Write about a person who has been kind to you recently.",
  "What is one small win you had this week?",
  "Describe a place where you feel completely at peace.",
  "What are you grateful for right now?",
  "Write a letter of encouragement to your future self.",
  "What is a challenge you overcame that you are proud of?",
  "Describe a moment today when you felt present and alive.",
  "What is one thing you can let go of that no longer serves you?",
  "Write about a song or piece of art that moved you.",
  "What strengths did you show today?",
  "If your best friend were struggling, what would you say to them? Now say it to yourself.",
  "What does self-care look like for you today?",
  "Describe a memory that brings you warmth.",
  "What is something new you learned about yourself this week?",
];

function getTodayPrompt(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

export default function Journal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const prompt = getTodayPrompt();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) return router.push("/login");
        setUser(d.user);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/journal")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries || []))
      .catch(() => {});
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, content: content.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setEntries((prev) => [data.entry, ...prev]);
      setContent("");
      toast.success("Journal entry saved.");
    } catch {
      toast.error("Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-200 to-indigo-200">
                <BookHeart className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate">Journal</h1>
                <p className="text-sm text-muted">Write your thoughts. No judgment, just space to breathe.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100 shadow-sm p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Prompt of the Day</span>
            </div>
            <p className="text-lg font-medium text-slate-700 leading-relaxed">{prompt}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-2xl bg-white border border-border shadow-sm p-5 mb-8"
          >
            <form onSubmit={handleSave}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                rows={6}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate outline-none focus:border-indigo-300 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted">{content.length} characters</span>
                <button
                  type="submit"
                  disabled={!content.trim() || saving}
                  className="rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 px-5 py-2.5 text-sm font-semibold text-white hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </motion.div>

          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-slate mb-3">Past Entries</h2>
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="rounded-xl bg-white border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider bg-indigo-50 rounded-md px-2 py-0.5">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted mb-1 italic">{entry.prompt}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Chatbot />
    </>
  );
}
