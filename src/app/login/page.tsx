"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Lock, User, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignIn) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error);
          return;
        }
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error);
          return;
        }
        toast.success("Account created successfully!");
        router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafaf9] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sage to-emerald-500 shadow-lg mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate">MindCare</h1>
          <p className="text-muted text-sm mt-1">Your Mental Wellness Companion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="flex rounded-xl bg-background p-1 mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                isSignIn ? "bg-white text-slate shadow-sm" : "text-muted hover:text-slate"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                !isSignIn ? "bg-white text-slate shadow-sm" : "text-muted hover:text-slate"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isSignIn && (
                <motion.div
                  key="name"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isSignIn}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-slate outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-slate outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-slate outline-none focus:border-sage focus:ring-1 focus:ring-sage/20 transition-all"
              />
            </div>

            <AnimatePresence mode="wait">
              {!isSignIn && (
                <motion.div
                  key="role"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-slate">Select Role</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                        role === "student"
                          ? "border-sage bg-mint"
                          : "border-border hover:border-sage/30"
                      }`}
                    >
                      <GraduationCap className={`h-5 w-5 ${role === "student" ? "text-sage" : "text-muted"}`} />
                      <span className={`text-sm font-medium ${role === "student" ? "text-sage" : "text-slate"}`}>
                        Student
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`flex flex-1 items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                        role === "admin"
                          ? "border-sky bg-blue-50"
                          : "border-border hover:border-sky/30"
                      }`}
                    >
                      <ShieldCheck className={`h-5 w-5 ${role === "admin" ? "text-sky" : "text-muted"}`} />
                      <span className={`text-sm font-medium ${role === "admin" ? "text-sky" : "text-slate"}`}>
                        Admin
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sage to-emerald-500 py-3 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-600 disabled:opacity-60 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {isSignIn ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {isSignIn && (
              <p className="text-center text-xs text-muted">
                Demo accounts: admin@mindcare.com / sarah@example.com / mike@example.com
                <br />
                (any password works for demo)
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
