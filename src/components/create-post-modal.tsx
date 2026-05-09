"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const TOPICS = [
  "Exam Stress",
  "Anxiety",
  "Depression",
  "Relationships",
  "Sleep",
  "Self-Care",
  "Motivation",
  "Loneliness",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    topic: string;
    isAnonymous: boolean;
  }) => void;
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim(), topic, isAnonymous });
    toast.success("Post created!");
    setTitle("");
    setContent("");
    setTopic(TOPICS[0]);
    setIsAnonymous(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-border">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold text-slate">Create Post</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">
                    Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          topic === t
                            ? "bg-sage text-white"
                            : "bg-background text-muted hover:bg-mint hover:text-sage border border-border"
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate mb-1.5">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
                  <div className="flex items-center gap-2 text-sm">
                    {isAnonymous ? (
                      <EyeOff className="h-4 w-4 text-muted" />
                    ) : (
                      <Eye className="h-4 w-4 text-sky" />
                    )}
                    <span className="text-slate font-medium">Post Anonymously</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isAnonymous ? "bg-sage" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isAnonymous ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-sage to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-600 transition-all active:scale-[0.98]"
                >
                  Post to Community
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
