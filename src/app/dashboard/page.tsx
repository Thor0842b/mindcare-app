"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Sparkles, BookOpen } from "lucide-react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resource-card";
import { ResourceViewer } from "@/components/resource-viewer";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  modulesCompleted: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user || meData.user.role !== "student") {
          router.push("/login");
          return;
        }
        setUser(meData.user);

        const resRes = await fetch("/api/resources");
        const resData = await resRes.json();
        setResources(resData.resources);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleView = async (resource: Resource) => {
    setViewingResource(resource);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource.id }),
      });
    } catch {
      // silent fail
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <ResourceViewer
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-muted mt-1">Here are your latest wellness resources.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint">
                  <Heart className="h-5 w-5 text-sage" />
                </div>
                <span className="text-sm text-muted">Resources</span>
              </div>
              <p className="text-2xl font-bold text-slate">{resources.length}</p>
            </div>
            <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Sparkles className="h-5 w-5 text-sky" />
                </div>
                <span className="text-sm text-muted">Completed</span>
              </div>
              <p className="text-2xl font-bold text-slate">{user?.modulesCompleted ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm text-muted">Categories</span>
              </div>
              <p className="text-2xl font-bold text-slate">
                {new Set(resources.map((r) => r.category)).size}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate">Suggested for You</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {resources.slice(0, 6).map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onView={handleView}
              />
            ))}
          </div>
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
