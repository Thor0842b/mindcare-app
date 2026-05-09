"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Chatbot } from "@/components/chatbot";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.user || data.user.role !== "admin") {
          router.push("/login");
          return;
        }
        setUserName(data.user.name);
        setReady(true);
      } catch {
        router.push("/login");
      }
    })();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <AdminSidebar userName={userName} />
      <div className="lg:pl-64">
        <main className="p-6 sm:p-8">{children}</main>
      </div>
      <Chatbot />
    </div>
  );
}
