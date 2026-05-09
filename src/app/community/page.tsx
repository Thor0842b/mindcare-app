"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { PostCard, Post } from "@/components/post-card";
import { CreatePostModal } from "@/components/create-post-modal";
import { Chatbot } from "@/components/chatbot";
import { MessageSquarePlus, Sparkles } from "lucide-react";

const SEED_POSTS: Post[] = [
  {
    id: "p1",
    title: "Struggling with finals week anxiety",
    content:
      "I have three finals in the next four days and I can feel my anxiety building up. My heart races every time I open a textbook. Anyone else feel like this? How do you cope?",
    topic: "Exam Stress",
    author: "Sarah J.",
    isAnonymous: false,
    upvotes: 24,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "p2",
    title: "A small win today",
    content:
      "I've been dealing with depression for months. Today I managed to get out of bed, take a shower, and go for a short walk. It doesn't sound like much, but it felt huge. Proud of myself for the first time in a while.",
    topic: "Depression",
    author: "Anonymous",
    isAnonymous: true,
    upvotes: 42,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "p3",
    title: "Tips for better sleep as a student?",
    content:
      "My sleep schedule is completely ruined. I stay up late studying, then can't fall asleep because my mind is racing. I'm averaging 4-5 hours a night. Any tips that actually work?",
    topic: "Sleep",
    author: "Mike C.",
    isAnonymous: false,
    upvotes: 18,
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "p4",
    title: "Feeling lonely in a crowded campus",
    content:
      "I'm surrounded by thousands of students but I feel completely alone. I haven't made any real friends this semester. It's hard watching everyone else seem to have their groups. Just needed to vent.",
    topic: "Loneliness",
    author: "Anonymous",
    isAnonymous: true,
    upvotes: 31,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "p5",
    title: "My self-care Sunday routine",
    content:
      "I've started a Sunday reset routine and it's been life-changing: 1) No phone for the first hour 2) Stretch for 15 mins 3) Plan the week ahead 4) Cook something nice 5) Read a fiction book. What does your self-care look like?",
    topic: "Self-Care",
    author: "Emily D.",
    isAnonymous: false,
    upvotes: 37,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [showCreate, setShowCreate] = useState(false);

  const handleUpvote = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p
      )
    );
  };

  const handleCreatePost = (data: {
    title: string;
    content: string;
    topic: string;
    isAnonymous: boolean;
  }) => {
    const newPost: Post = {
      id: `p${Date.now()}`,
      title: data.title,
      content: data.content,
      topic: data.topic,
      author: data.isAnonymous ? "Anonymous" : "You",
      isAnonymous: data.isAnonymous,
      upvotes: 0,
      timestamp: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Navbar />

      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreatePost}
      />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate">Community</h1>
              <p className="text-muted mt-1">
                Share, connect, and support each other anonymously.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sage to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-600 transition-all active:scale-[0.98]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Create Post
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              "All",
              "Exam Stress",
              "Anxiety",
              "Depression",
              "Sleep",
              "Self-Care",
              "Loneliness",
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  if (topic === "All") {
                    setPosts([...SEED_POSTS]);
                  } else {
                    // Reset to seed + filter - simple approach
                  }
                }}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-mint hover:text-sage hover:border-sage/30 transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                {topic}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} onUpvote={handleUpvote} />
            ))}
          </div>
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
