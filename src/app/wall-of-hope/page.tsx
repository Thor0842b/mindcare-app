"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Send, Quote } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import { WallPost } from "@/lib/types";
import toast from "react-hot-toast";

const NOTE_COLORS = [
  "bg-amber-50 border-amber-200",
  "bg-rose-50 border-rose-200",
  "bg-sky-50 border-sky-200",
  "bg-lime-50 border-lime-200",
  "bg-purple-50 border-purple-200",
  "bg-teal-50 border-teal-200",
  "bg-pink-50 border-pink-200",
  "bg-orange-50 border-orange-200",
  "bg-indigo-50 border-indigo-200",
  "bg-emerald-50 border-emerald-200",
];

const ROTATIONS = ["-rotate-1", "-rotate-0.5", "rotate-0", "rotate-0.5", "rotate-1"];

export default function WallOfHope() {
  const router = useRouter();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

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
    fetch("/api/wall-of-hope")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setFetched(true); })
      .catch(() => setFetched(true));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/wall-of-hope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post");
      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
      setMessage("");
      toast.success("Your message has been posted anonymously.");
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
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-200 to-amber-200">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate">Wall of Hope</h1>
                <p className="text-sm text-muted">
                  Anonymous messages of encouragement from the community.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white border border-border shadow-sm p-5 mb-8"
          >
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write an anonymous message of hope..."
                maxLength={200}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate outline-none focus:border-rose-300 transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim() || submitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-amber-400 px-5 py-3 text-sm font-semibold text-white hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 transition-all"
              >
                {submitting ? "Posting..." : <><Send className="h-4 w-4" /> Post</>}
              </button>
            </form>
            <p className="text-[10px] text-muted mt-2">
              Your message will appear anonymously. All messages are public and visible to everyone.
            </p>
          </motion.div>

          {!fetched ? (
            <div className="text-center text-muted text-sm py-12">Loading messages...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted text-sm py-12">
              <Quote className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No messages yet. Be the first to share hope.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {posts.map((post, idx) => {
                const color = NOTE_COLORS[idx % NOTE_COLORS.length];
                const rot = ROTATIONS[idx % ROTATIONS.length];
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                    className={`break-inside-avoid rounded-xl border-2 p-4 shadow-sm ${color} ${rot} hover:rotate-0 transition-all duration-200`}
                    style={{ transformOrigin: "center" }}
                  >
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      &ldquo;{post.message}&rdquo;
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Heart className="h-3 w-3 text-rose-400" />
                      <span className="text-[10px] text-muted">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Chatbot />
    </>
  );
}
