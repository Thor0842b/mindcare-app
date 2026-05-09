"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Wallet, Plus, Trash2, AlertCircle, BookOpen, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Navbar } from "@/components/navbar";
import { Chatbot } from "@/components/chatbot";
import { FinanceEntry, AcademicEvent } from "@/lib/types";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = ["Mess Fees", "Rent", "Travel", "Entertainment", "Books", "Phone", "Other"];
const INCOME_CATEGORIES = ["Monthly Allowance", "Part-time Job", "Scholarship", "Other"];

export default function LifeSkillLab() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);

  // Finance state
  const [finances, setFinances] = useState<FinanceEntry[]>([]);
  const [finType, setFinType] = useState<"income" | "expense">("expense");
  const [finCategory, setFinCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [finAmount, setFinAmount] = useState("");
  const [finNote, setFinNote] = useState("");
  const [finDate, setFinDate] = useState(new Date().toISOString().split("T")[0]);

  // Academic events
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [evTitle, setEvTitle] = useState("");
  const [evType, setEvType] = useState<"exam" | "assignment" | "class" | "other">("exam");
  const [evStart, setEvStart] = useState("");
  const [evEnd, setEvEnd] = useState("");

  // Stress forecast
  const [forecast, setForecast] = useState<{ week: string; count: number }[]>([]);

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
    fetch("/api/finances").then((r) => r.json()).then((d) => setFinances(d.entries || [])).catch(() => {});
    fetch("/api/academic-events").then((r) => r.json()).then((d) => {
      setEvents(d.events || []);
      computeForecast(d.events || []);
    }).catch(() => {});
  }, [user]);

  const computeForecast = (evts: AcademicEvent[]) => {
    if (evts.length === 0) { setForecast([]); return; }
    const weeks: Record<string, number> = {};
    evts.forEach((e) => {
      if (e.type === "exam") {
        const d = new Date(e.start);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split("T")[0];
        weeks[key] = (weeks[key] || 0) + 1;
      }
    });
    setForecast(
      Object.entries(weeks)
        .filter(([, count]) => count >= 2)
        .map(([week, count]) => ({ week, count }))
        .sort((a, b) => a.week.localeCompare(b.week))
    );
  };

  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(finAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      const res = await fetch("/api/finances", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: finType, category: finCategory, amount, note: finNote, date: finDate }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFinances((prev) => [data.entry, ...prev]);
      setFinAmount(""); setFinNote("");
      toast.success("Entry added");
    } catch { toast.error("Failed to add"); }
  };

  const handleDeleteFinance = async (id: string) => {
    try {
      await fetch(`/api/finances?id=${id}`, { method: "DELETE" });
      setFinances((prev) => prev.filter((f) => f.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle || !evStart) { toast.error("Title and date required"); return; }
    try {
      const res = await fetch("/api/academic-events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: evTitle, start: evStart, end: evEnd || undefined, type: evType }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const updated = [...events, data.event];
      setEvents(updated);
      computeForecast(updated);
      setEvTitle(""); setEvStart(""); setEvEnd("");
      toast.success("Event added to calendar");
    } catch { toast.error("Failed to add event"); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/academic-events?id=${id}`, { method: "DELETE" });
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      computeForecast(updated);
    } catch { toast.error("Failed to delete"); }
  };

  const handleDateClick = (info: { dateStr: string }) => {
    setEvStart(info.dateStr);
  };

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end || undefined,
    backgroundColor: e.type === "exam" ? "#ef4444" : e.type === "assignment" ? "#f59e0b" : e.type === "class" ? "#3b82f6" : "#10b981",
    borderColor: "transparent",
    textColor: "#fff",
  }));

  const totalIncome = finances.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);

  if (loading) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-rose-200">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate">Life Skill Lab</h1>
                <p className="text-sm text-muted">Manage your academics and finances. Stay ahead of stress.</p>
              </div>
            </div>
          </motion.div>

          {/* Stress Forecast Banner */}
          {forecast.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mb-6">
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 text-sm">Stress Forecast</h3>
                    <div className="mt-1 space-y-1">
                      {forecast.slice(0, 3).map((f) => {
                        const weekEnd = new Date(f.week);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return (
                          <p key={f.week} className="text-sm text-amber-700">
                            <strong>{f.count} exams</strong> in the week of {new Date(f.week).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}–{weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2.5 border border-amber-200">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-medium text-amber-800">
                        Pre-emptive Self-Care Session Recommended
                      </p>
                    </div>
                    <p className="text-xs text-amber-600 mt-1.5">
                      Consider booking a session or visiting the Zen Zone to recharge before a heavy week.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Academic Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <CalendarIcon className="h-5 w-5 text-rose-400" />
                  <h2 className="font-semibold text-slate text-sm">Academic Calendar</h2>
                </div>
                <div className="p-4">
                  <div className="fc-custom">
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={calendarEvents}
                      dateClick={handleDateClick}
                      height={320}
                      headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth" }}
                    />
                  </div>
                </div>
                <div className="border-t border-border px-6 py-4">
                  <form onSubmit={handleAddEvent} className="flex flex-wrap gap-2">
                    <input type="text" placeholder="Event title" value={evTitle} onChange={(e) => setEvTitle(e.target.value)}
                      className="flex-1 min-w-[140px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-rose-300 transition-colors" />
                    <select value={evType} onChange={(e) => setEvType(e.target.value as any)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-rose-300 transition-colors">
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="class">Class</option>
                      <option value="other">Other</option>
                    </select>
                    <input type="date" value={evStart} onChange={(e) => setEvStart(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-rose-300 transition-colors w-[140px]" />
                    <input type="date" value={evEnd} onChange={(e) => setEvEnd(e.target.value)} placeholder="End (optional)"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-rose-300 transition-colors w-[140px]" />
                    <button type="submit"
                      className="rounded-lg bg-rose-400 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {events.slice(0, 10).map((e) => (
                      <div key={e.id} className="flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-[10px]">
                        <span className={`h-2 w-2 rounded-full ${e.type === "exam" ? "bg-red-400" : e.type === "assignment" ? "bg-amber-400" : e.type === "class" ? "bg-blue-400" : "bg-emerald-400"}`} />
                        <span className="text-slate font-medium truncate max-w-[100px]">{e.title}</span>
                        <span className="text-muted">{new Date(e.start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        <button onClick={() => handleDeleteEvent(e.id)} className="text-red-300 hover:text-red-500 ml-0.5"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Tracker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              <div className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <h2 className="font-semibold text-slate text-sm">Financial Tracker</h2>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 px-6 pt-4 pb-2">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Income</p>
                    <p className="text-lg font-bold text-emerald-700">₹{totalIncome.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
                    <p className="text-[10px] text-rose-600 font-medium uppercase tracking-wider">Expenses</p>
                    <p className="text-lg font-bold text-rose-700">₹{totalExpense.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="px-6 pb-4">
                  <form onSubmit={handleAddFinance} className="space-y-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setFinType("income"); setFinCategory(INCOME_CATEGORIES[0]); }}
                        className={`flex-1 rounded-lg border-2 py-2 text-xs font-semibold transition-all ${finType === "income" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-border text-muted hover:border-emerald-200"}`}>
                        <TrendingUp className="h-3.5 w-3.5 inline mr-1" /> Income
                      </button>
                      <button type="button" onClick={() => { setFinType("expense"); setFinCategory(EXPENSE_CATEGORIES[0]); }}
                        className={`flex-1 rounded-lg border-2 py-2 text-xs font-semibold transition-all ${finType === "expense" ? "border-rose-400 bg-rose-50 text-rose-700" : "border-border text-muted hover:border-rose-200"}`}>
                        <TrendingDown className="h-3.5 w-3.5 inline mr-1" /> Expense
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select value={finCategory} onChange={(e) => setFinCategory(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-emerald-300 transition-colors">
                        {(finType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input type="number" placeholder="Amount" value={finAmount} onChange={(e) => setFinAmount(e.target.value)} min="1"
                        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-emerald-300 transition-colors" />
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Note (optional)" value={finNote} onChange={(e) => setFinNote(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-emerald-300 transition-colors" />
                      <input type="date" value={finDate} onChange={(e) => setFinDate(e.target.value)}
                        className="w-[130px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-slate outline-none focus:border-emerald-300 transition-colors" />
                      <button type="submit"
                        className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Entries list */}
                <div className="max-h-64 overflow-y-auto border-t border-border px-6 py-3">
                  {finances.length === 0 ? (
                    <p className="text-xs text-muted text-center py-4">No entries yet. Add your first income or expense.</p>
                  ) : finances.slice(0, 20).map((f) => (
                    <div key={f.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${f.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                          {f.type === "income" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate truncate">{f.note || f.category}</p>
                          <p className="text-[10px] text-muted">{f.category} · {new Date(f.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${f.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                          {f.type === "income" ? "+" : "-"}₹{f.amount.toLocaleString("en-IN")}
                        </span>
                        <button onClick={() => handleDeleteFinance(f.id)} className="text-red-300 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
      <Chatbot />
    </>
  );
}
