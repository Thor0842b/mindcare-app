"use client";

import { Film, Headphones, FileText, Play, BookOpen } from "lucide-react";
import { Resource } from "@/lib/types";

const categoryIcons: Record<string, React.ReactNode> = {
  Video: <Film className="h-5 w-5" />,
  Audio: <Headphones className="h-5 w-5" />,
  Article: <FileText className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  Video: "bg-blue-50 text-blue-600",
  Audio: "bg-purple-50 text-purple-600",
  Article: "bg-amber-50 text-amber-600",
};

interface Props {
  resource: Resource;
  onView: (resource: Resource) => void;
}

export function ResourceCard({ resource, onView }: Props) {
  return (
    <div className="flex-shrink-0 w-64 rounded-2xl bg-white border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      <div
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-3 ${categoryColors[resource.category]}`}
      >
        {categoryIcons[resource.category]}
        {resource.category}
      </div>
      <h3 className="font-semibold text-slate text-sm leading-snug mb-3 flex-1">
        {resource.title}
      </h3>
      <button
        onClick={() => onView(resource)}
        className="flex items-center justify-center gap-2 rounded-xl bg-sage text-white py-2.5 text-sm font-medium hover:bg-emerald-600 transition-colors active:scale-95"
      >
        {resource.category === "Article" ? (
          <BookOpen className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {resource.category === "Article" ? "Read" : "Play"}
      </button>
    </div>
  );
}
