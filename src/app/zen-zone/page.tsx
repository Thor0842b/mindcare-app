"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Wand2, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import BubblePop from "@/components/bubble-pop";
import toast from "react-hot-toast";

export default function ZenZone() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feeling, setFeeling] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [generating, setGenerating] = useState(false);
  const [affirmationKey, setAffirmationKey] = useState(0);

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

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-200 to-blue-200">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate">Zen Zone</h1>
                <p className="text-sm text-muted">
                  A calm space to pause, breathe, and reset.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white/60 border border-border shadow-sm overflow-hidden mb-6"
          >
            <div className="px-6 pt-5 pb-3 border-b border-border/50">
              <h2 className="font-semibold text-slate text-sm">Bubble Pop</h2>
              <p className="text-xs text-muted mt-0.5">
                Tap the floating bubbles for a gentle reminder and a soft chime.
              </p>
            </div>
            <div className="p-4">
              <BubblePop />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl bg-white/60 border border-border shadow-sm overflow-hidden mb-6"
          >
            <div className="px-6 pt-5 pb-3 border-b border-border/50">
              <h2 className="font-semibold text-slate text-sm">AI Affirmation</h2>
              <p className="text-xs text-muted mt-0.5">
                Tell me how you feel, and I&rsquo;ll generate a personal affirmation for you.
              </p>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="e.g. I feel anxious about tomorrow..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-emerald-300 transition-colors"
                />
                <button
                  onClick={async () => {
                    setGenerating(true);
                    try {
                      const res = await fetch("/api/affirmation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ feeling: feeling || undefined }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error);
                      setAffirmation(data.affirmation);
                      setAffirmationKey((k) => k + 1);
                    } catch (err: any) {
                      toast.error(err.message || "Failed to generate");
                    } finally {
                      setGenerating(false);
                    }
                  }}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2.5 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
                >
                  {generating ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {generating ? "Generating..." : "I need a boost"}
                </button>
              </div>

              {affirmation && (
                <motion.div
                  key={affirmationKey}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4"
                >
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{affirmation}&rdquo;
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-2xl bg-white/60 border border-border shadow-sm p-6"
          >
            <h3 className="text-sm font-semibold text-slate mb-3">Why this helps</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Popping bubbles gives a gentle sensory reward that interrupts anxious thoughts.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                The soft chime and affirmation create a calming feedback loop.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                No timers, no scores — just a moment of peace whenever you need it.
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
      <Chatbot />
    </>
  );
}
