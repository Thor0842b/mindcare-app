"use client";

import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export interface Post {
  id: string;
  title: string;
  content: string;
  topic: string;
  author: string;
  isAnonymous: boolean;
  upvotes: number;
  timestamp: string;
}

interface Props {
  post: Post;
  onUpvote: (id: string) => void;
}

const topicColors: Record<string, string> = {
  "Exam Stress": "bg-rose-50 text-rose-600",
  "Anxiety": "bg-amber-50 text-amber-600",
  "Depression": "bg-blue-50 text-blue-600",
  "Relationships": "bg-purple-50 text-purple-600",
  "Sleep": "bg-indigo-50 text-indigo-600",
  "Self-Care": "bg-green-50 text-green-600",
  "Motivation": "bg-orange-50 text-orange-600",
  "Loneliness": "bg-teal-50 text-teal-600",
};

export function PostCard({ post, onUpvote }: Props) {
  const [animating, setAnimating] = useState(false);

  const handleUpvote = () => {
    setAnimating(true);
    onUpvote(post.id);
    toast.success("Upvoted!", { duration: 1500 });
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <div className="rounded-2xl bg-white border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate text-sm leading-snug mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            topicColors[post.topic] || "bg-gray-50 text-gray-600"
          }`}
        >
          <Sparkles className="h-3 w-3" />
          {post.topic}
        </span>
        <span className="text-xs text-muted">
          {post.isAnonymous ? "Anonymous" : post.author}
        </span>
        <span className="text-xs text-muted">
          {new Date(post.timestamp).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            animating
              ? "text-red-500 bg-red-50 scale-110"
              : "text-muted hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              animating ? "fill-red-500 scale-125" : ""
            }`}
          />
          {post.upvotes}
        </button>
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <MessageCircle className="h-4 w-4" />
          {Math.floor(Math.random() * 5)} replies
        </span>
      </div>
    </div>
  );
}
