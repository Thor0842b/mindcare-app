"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Film, Headphones, FileText, Filter } from "lucide-react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resource-card";
import { ResourceViewer } from "@/components/resource-viewer";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";

export default function ResourceHub() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<string>("All");
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
      // silent
    }
  };

  const filtered = filter === "All" ? resources : resources.filter((r) => r.category === filter);
  const categories = ["All", ...new Set(resources.map((r) => r.category))];

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
            <h1 className="text-2xl font-bold text-slate">Resource Hub</h1>
            <p className="text-muted mt-1">Explore videos, articles, and audio to support your wellness journey.</p>
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
            <Filter className="h-4 w-4 text-muted flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? "bg-sage text-white"
                    : "bg-white border border-border text-muted hover:border-sage/30"
                }`}
              >
                {cat === "Video" && <Film className="h-4 w-4" />}
                {cat === "Audio" && <Headphones className="h-4 w-4" />}
                {cat === "Article" && <FileText className="h-4 w-4" />}
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted">No resources found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
