"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  X,
  Heart,
  Sparkles,
  BookHeart,
  BookOpenCheck,
  MessageCircle,
} from "lucide-react";
import EmergencySOS from "./emergency-sos";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resource Hub", icon: BookOpen },
  { href: "/life-skill-lab", label: "Life Skill Lab", icon: BookOpenCheck },
  { href: "/talk-campus", label: "Talk Campus", icon: MessageCircle },
  { href: "/zen-zone", label: "Zen Zone", icon: Sparkles },
  { href: "/journal", label: "Journal", icon: BookHeart },
  { href: "/community", label: "Community", icon: Users },
  { href: "/wall-of-hope", label: "Wall of Hope", icon: Heart },
  { href: "/book-session", label: "Book Session", icon: CalendarDays },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUserName(data.user.name);
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/me", { method: "POST" });
    router.push("/login");
  };

  if (!loaded) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sage to-emerald-500 text-white font-bold text-sm">
              M
            </div>
            <span className="font-semibold text-slate hidden sm:inline">MindCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-mint text-sage"
                      : "text-muted hover:text-slate hover:bg-background"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <EmergencySOS />
          {userName && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky to-blue-400 text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate font-medium max-w-[120px] truncate">{userName}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-background transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl hover:bg-background transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

          {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Menu</span>
            <EmergencySOS />
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-mint text-sage"
                    : "text-muted hover:text-slate hover:bg-background"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <hr className="border-border my-2" />
          {userName && (
            <div className="flex items-center gap-3 px-3.5 py-2 text-sm text-muted">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky text-white text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              {userName}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
