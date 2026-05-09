"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Send, Shield, Flag } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import { TalkPost } from "@/lib/types";
import toast from "react-hot-toast";

export default function TalkCampus() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TalkPost[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    fetch("/api/talk-campus")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const filterRes = await fetch("/api/profanity-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      const filterData = await filterRes.json();

      if (!filterData.safe) {
        toast.error("Message flagged: " + (filterData.reason || "Please keep the conversation respectful."));
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/talk-campus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
      setMessage("");
      toast.success("Message posted anonymously.");
    } catch {
      toast.error("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-200 to-teal-200">
                <MessageCircle className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate">Talk Campus</h1>
                <p className="text-sm text-muted">
                  Anonymous peer support. No names, no judgments — just people who get it.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white border border-border shadow-sm p-5 mb-6"
          >
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share what&rsquo;s on your mind..."
                maxLength={500}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate outline-none focus:border-teal-300 transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim() || submitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-sky-400 px-5 py-3 text-sm font-semibold text-white hover:from-teal-500 hover:to-sky-500 disabled:opacity-50 transition-all"
              >
                {submitting ? "..." : <><Send className="h-4 w-4" /> Send</>}
              </button>
            </form>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-teal-400" /> AI-profaniy filter active</span>
              <span className="flex items-center gap-1"><Flag className="h-3 w-3 text-amber-400" /> Anonymous</span>
            </div>
          </motion.div>

          {posts.length === 0 ? (
            <div className="text-center text-muted text-sm py-12">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No messages yet. Be the first to start a conversation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                  className="rounded-xl bg-white border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-slate-700 leading-relaxed">{post.message}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-200 to-sky-200">
                      <MessageCircle className="h-3 w-3 text-teal-600" />
                    </div>
                    <span className="text-[10px] text-muted">Anonymous · {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Chatbot />
    </>
  );
}
