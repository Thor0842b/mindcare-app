"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Users, Search, PlayCircle,
  BarChart3, PieChart, Upload, FileText, ImageUp,
  RotateCcw, CalendarDays, Clock, Fingerprint, CheckCircle, XCircle, Video, Ban, StickyNote, GripVertical,
} from "lucide-react";
import {
  BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Resource, User, SurveyChartData, Booking } from "@/lib/types";
import toast from "react-hot-toast";

const CHART_COLORS: Record<string, string[]> = {
  bar: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"],
  pie: ["#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6", "#f97316"],
  line: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
};
const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  bar: { label: "Bar", bg: "bg-emerald-50", text: "text-emerald-600" },
  pie: { label: "Pie", bg: "bg-purple-50", text: "text-purple-600" },
  line: { label: "Line", bg: "bg-indigo-50", text: "text-indigo-600" },
};

function getSessionStatus(booking: Booking): { status: string; label: string; color: string; bg: string; rowGlow: boolean } {
  if (booking.status === "cancelled") return { status: "cancelled", label: "Cancelled", color: "text-red-600", bg: "bg-red-50", rowGlow: false };
  if (booking.status === "no-show") return { status: "no-show", label: "No Show", color: "text-orange-600", bg: "bg-orange-50", rowGlow: false };

  const now = new Date();
  const [timeStr, period] = booking.time.split(" ");
  const [hours, minutes] = timeStr.split(":").map(Number);
  let hour = hours;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const startTime = new Date(booking.date);
  startTime.setHours(hour, minutes, 0, 0);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  if (now > endTime) return { status: "completed", label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", rowGlow: false };
  if (now >= startTime && now <= endTime) return { status: "active", label: "In-Progress", color: "text-green-600", bg: "bg-green-100", rowGlow: true };
  return { status: "upcoming", label: "Upcoming", color: "text-blue-600", bg: "bg-blue-50", rowGlow: false };
}

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [surveyCharts, setSurveyCharts] = useState<SurveyChartData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [notesBooking, setNotesBooking] = useState<Booking | null>(null);
  const [notesText, setNotesText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Video" | "Audio" | "Article">("Video");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chartFile, setChartFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSourceRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chartFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchData = async () => {
    const [resRes, progRes, surveyRes, bookingsRes] = await Promise.all([
      fetch("/api/resources"),
      fetch("/api/progress"),
      fetch("/api/survey-data"),
      fetch("/api/bookings"),
    ]);
    const resData = await resRes.json();
    const progData = await progRes.json();
    const surveyData = await surveyRes.json();
    const bookingsData = await bookingsRes.json();
    setResources(resData.resources);
    setStudents(progData.students || []);
    setSurveyCharts(surveyData.charts || []);
    setBookings(bookingsData.bookings || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { toast.error("Title is required"); return; }
    setAdding(true);
    try {
      let audioUrl = "";
      let articleBody = "";
      let resourceUrl = url;

      if (category === "Audio" && file) {
        setUploading(true);
        audioUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
        resourceUrl = "";
      }

      if (category === "Article" && file) {
        articleBody = await file.text();
        resourceUrl = "";
      }

      if (category === "Article" && body.trim()) {
        articleBody = body;
        resourceUrl = "";
      }

      if (category === "Video" && !resourceUrl) {
        toast.error("Video URL is required");
        setAdding(false); setUploading(false); return;
      }

      const res = await fetch("/api/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, url: resourceUrl, audioUrl: audioUrl || undefined, body: articleBody || undefined }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to add resource"); }
      const data = await res.json();
      setResources((prev) => [...prev, data.resource]);
      toast.success("Resource added!");
      setTitle(""); setUrl(""); setBody(""); setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setCategory("Video");
    } catch (err: any) { toast.error(err.message || "Failed to add resource"); }
    finally { setAdding(false); setUploading(false); }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...resources];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setResources(reordered);
    try {
      const res = await fetch("/api/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((r) => r.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to save order");
      fetchData();
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setResources((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resource deleted");
    } catch { toast.error("Failed to delete resource"); }
  };

  const handleAnalyzeChart = async () => {
    if (!chartFile) { toast.error("Select a chart image"); return; }
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", chartFile);
      formData.append("type", "auto");

      const res = await fetch("/api/analyze-chart", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Analysis failed");

      const extracted = result.charts || [];
      if (extracted.length === 0) throw new Error("No charts found in image");

      let savedCount = 0;
      for (const chart of extracted) {
        const saveRes = await fetch("/api/survey-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chart),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          setSurveyCharts((prev) => [...prev, saved.chart]);
          savedCount++;
        }
      }

      toast.success(`Found ${extracted.length} chart${extracted.length > 1 ? "s" : ""} — ${savedCount} saved`);
      setChartFile(null);
      if (chartFileRef.current) chartFileRef.current.value = "";
    } catch (err: any) { toast.error(err.message || "Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const handleClearCharts = async () => {
    if (!confirm("Clear all survey charts?")) return;
    await fetch("/api/survey-data", { method: "DELETE" });
    setSurveyCharts([]);
    toast.success("Charts cleared");
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChart = async (id: string) => {
    if (!confirm("Delete this chart?")) return;
    try {
      await fetch(`/api/survey-data?id=${id}`, { method: "DELETE" });
      setSurveyCharts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Chart removed");
    } catch { toast.error("Failed to delete chart"); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate">Admin Dashboard</h1>
        <p className="text-muted mt-1">Analytics, resource management, and student progress.</p>
      </div>

      {/* Survey Chart Upload */}
      <div className="rounded-2xl bg-white border border-border p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageUp className="h-5 w-5 text-sage" />
            <h3 className="font-semibold text-slate">Upload Survey Chart</h3>
          </div>
          {surveyCharts.length > 0 && (
            <button onClick={handleClearCharts} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500">
              <RotateCcw className="h-3 w-3" /> Clear All
            </button>
          )}
        </div>
        <p className="text-xs text-muted mb-4">
          Upload a photo of a bar graph or pie chart from a survey. AI will extract the data and update the dashboard.
        </p>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted hover:border-sage/40 flex-1">
            <Upload className="h-4 w-4 text-sage" />
            <span className="truncate">{chartFile ? chartFile.name : "Select chart image..."}</span>
            <input ref={chartFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setChartFile(e.target.files?.[0] || null)} />
          </label>
          <button onClick={handleAnalyzeChart} disabled={!chartFile || analyzing}
            className="flex items-center gap-2 rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
            {analyzing ? <><RotateCcw className="h-4 w-4 animate-spin" /> Analyzing...</> : <><ImageUp className="h-4 w-4" /> Analyze</>}
          </button>
        </div>
        {surveyCharts.length > 0 && (
          <p className="text-xs text-muted mt-2">{surveyCharts.length} chart{surveyCharts.length > 1 ? "s" : ""} uploaded</p>
        )}
      </div>

      {/* Survey Chart Gallery */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate">Survey Charts</h2>
          {surveyCharts.length > 0 && (
            <span className="text-xs text-muted">{surveyCharts.length} chart{surveyCharts.length > 1 ? "s" : ""}</span>
          )}
        </div>
        {surveyCharts.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-sage" />
                <h3 className="font-semibold text-slate text-sm">Charts</h3>
              </div>
              <div className="h-64 flex items-center justify-center text-muted text-sm">
                Upload survey charts to see data here
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-slate text-sm">Pie Charts</h3>
              </div>
              <div className="h-64 flex items-center justify-center text-muted text-sm">
                Upload survey charts to see data here
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {surveyCharts.map((chart, idx) => {
              const badge = TYPE_BADGE[chart.type] || TYPE_BADGE.bar;
              const colors = CHART_COLORS[chart.type] || CHART_COLORS.bar;
              const data = chart.labels.map((l, i) => ({ label: l, value: chart.values[i] || 0, name: l }));
              const maxVal = Math.max(...data.map(d => d.value), 1);

              return (
                <motion.div
                  key={chart.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${badge.bg}`}>
                        {chart.type === "pie" ? (
                          <PieChart className={`h-4 w-4 ${badge.text}`} />
                        ) : chart.type === "line" ? (
                          <BarChart3 className={`h-4 w-4 ${badge.text} rotate-0`} />
                        ) : (
                          <BarChart3 className={`h-4 w-4 ${badge.text}`} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-slate truncate">
                          {chart.title || `Chart ${idx + 1}`}
                        </h3>
                        <span className={`inline-block mt-0.5 text-[10px] font-medium ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteChart(chart.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Chart body */}
                  <div className="px-4 pb-2" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === "pie" ? (
                        <RePieChart>
                          <Pie
                            data={data}
                            cx="50%" cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.map((_, i) => (
                              <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          />
                        </RePieChart>
                      ) : chart.type === "line" ? (
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          />
                          <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2.5} dot={{ fill: colors[0], r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      ) : (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          />
                          <Bar dataKey="value" fill={colors[0]} radius={[5, 5, 0, 0]} maxBarSize={40}>
                            {data.map((_, i) => (
                              <Cell key={i} fill={colors[i % colors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Legend / footer for pie charts */}
                  {chart.type === "pie" && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-5 pb-4 pt-1 border-t border-border/50 mt-1">
                      {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px]">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
                          <span className="text-muted">{d.name}</span>
                          <span className="font-medium text-slate">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Management */}
      <div id="bookings" className="rounded-2xl bg-white border border-border shadow-sm mb-6">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <Fingerprint className="h-5 w-5 text-sage" />
          <h2 className="font-semibold text-slate">Session Management</h2>
          <span className="ml-auto text-xs text-muted">{bookings.length} session{bookings.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Token Verification */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-slate mb-3">Verify a Token</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter token (e.g. MC-89X2-ZL)"
              value={verifyToken}
              onChange={(e) => { setVerifyToken(e.target.value.toUpperCase()); setVerifiedBooking(null); }}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono text-slate outline-none focus:border-sage transition-colors"
            />
            <button
              onClick={async () => {
                if (!verifyToken.trim()) return;
                setVerifying(true);
                try {
                  const res = await fetch(`/api/bookings?token=${encodeURIComponent(verifyToken.trim())}`);
                  if (!res.ok) { setVerifiedBooking(null); toast.error("Token not found"); return; }
                  const data = await res.json();
                  setVerifiedBooking(data.booking);
                  toast.success("Token verified!");
                } catch { toast.error("Verification failed"); }
                finally { setVerifying(false); }
              }}
              disabled={!verifyToken.trim() || verifying}
              className="flex items-center gap-2 rounded-xl bg-sage px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {verifying ? "Checking..." : <><CheckCircle className="h-4 w-4" /> Verify</>}
            </button>
          </div>

          {verifiedBooking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl bg-mint border border-sage/20 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-700 text-sm">Valid Token</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted">Token</p>
                  <p className="font-mono font-bold text-slate">{verifiedBooking.token}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Date</p>
                  <p className="font-medium text-slate">{new Date(verifiedBooking.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Time</p>
                  <p className="font-medium text-slate">{verifiedBooking.time}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Counselor</p>
                  <p className="font-medium text-slate">{verifiedBooking.counselor}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted mt-2">No student identity stored — fully anonymous.</p>
            </motion.div>
          )}
        </div>

        {/* Session Management Table */}
        <div className="p-6">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-medium text-muted">Token ID</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Appointment Time</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Assigned Counselor</th>
                    <th className="text-right py-3 px-3 font-medium text-muted">Action / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const session = getSessionStatus(b);
                    return (
                      <tr
                        key={b.id}
                        className={`border-b border-border/50 transition-all ${
                          session.rowGlow
                            ? "bg-green-50/60 shadow-[0_0_0_1px_#22c55e40]"
                            : "hover:bg-background/50"
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-bold text-sage text-xs tracking-wider">{b.token}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted flex-shrink-0" />
                            <span className="text-slate">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            <Clock className="h-4 w-4 text-muted flex-shrink-0" />
                            <span className="text-slate">{b.time}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${session.bg} ${session.color}`}>
                            {session.status === "active" && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                            {session.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate">{b.counselor}</td>
                        <td className="py-3.5 px-3 text-right">
                          {session.status === "completed" && (
                            <button
                              onClick={() => { setNotesBooking(b); setNotesText(b.notes || ""); }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-background transition-colors"
                            >
                              <StickyNote className="h-3.5 w-3.5" />
                              {b.notes ? "View Notes" : "Add Notes"}
                            </button>
                          )}
                          {session.status === "active" && (
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors shadow-sm"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Join Room
                            </button>
                          )}
                          {session.status === "upcoming" && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Cancel session ${b.token}?`)) return;
                                try {
                                  const res = await fetch(`/api/bookings?id=${b.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "cancelled" }),
                                  });
                                  if (!res.ok) throw new Error("Failed to cancel");
                                  setBookings((prev) => prev.map((b2) => b2.id === b.id ? { ...b2, status: "cancelled" } : b2));
                                  toast.success("Session cancelled.");
                                } catch { toast.error("Failed to cancel."); }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Session Notes Modal */}
      {notesBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setNotesBooking(null)}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate">Session Notes</h3>
              <button onClick={() => setNotesBooking(null)} className="rounded-full p-1 hover:bg-background transition-colors">
                <XCircle className="h-5 w-5 text-muted" />
              </button>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Fingerprint className="h-3.5 w-3.5" />
                <span className="font-mono font-bold text-slate">{notesBooking.token}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(notesBooking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {notesBooking.time}
              </div>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add confidential session notes here..."
              rows={6}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate outline-none focus:border-sage transition-colors resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setNotesBooking(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/bookings?id=${notesBooking.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ notes: notesText }),
                    });
                    if (!res.ok) throw new Error("Failed to save");
                    setBookings((prev) => prev.map((b2) => b2.id === notesBooking.id ? { ...b2, notes: notesText } : b2));
                    toast.success("Notes saved.");
                    setNotesBooking(null);
                  } catch { toast.error("Failed to save notes."); }
                }}
                className="flex-1 rounded-xl bg-sage py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Resource Manager */}
        <div className="rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <BookOpen className="h-5 w-5 text-sage" />
            <h2 className="font-semibold text-slate">Resource Manager</h2>
          </div>
          <form onSubmit={handleAddResource} className="p-6 border-b border-border space-y-4">
            <input type="text" placeholder="Resource Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors" />
            <div className="flex gap-3">
              {(["Video", "Audio", "Article"] as const).map((cat) => (
                <button key={cat} type="button" onClick={() => { setCategory(cat); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className={`flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-all ${category === cat ? "border-sage bg-mint text-sage" : "border-border text-muted hover:border-sage/30"}`}>{cat}</button>
              ))}
            </div>
            {category === "Video" && (
              <input type="url" placeholder="YouTube URL" value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors" />
            )}
            {category === "Audio" && (
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-sm text-muted hover:border-sage/40 transition-colors">
                  <Upload className="h-5 w-5 text-sage" />
                  <span>{file ? file.name : "Upload MP3 audio file"}</span>
                  <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,.m4a" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <div className="flex items-center gap-2 text-xs text-muted"><span className="h-px flex-1 bg-border" /><span>or paste URL</span><span className="h-px flex-1 bg-border" /></div>
                <input type="url" placeholder="Audio URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors" />
              </div>
            )}
            {category === "Article" && (
              <div className="space-y-3">
                <textarea placeholder="Paste article content here..." value={body} onChange={(e) => setBody(e.target.value)} rows={5}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-slate outline-none focus:border-sage transition-colors resize-none" />
                <div className="flex items-center gap-2 text-xs text-muted"><span className="h-px flex-1 bg-border" /><span>or upload text file</span><span className="h-px flex-1 bg-border" /></div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm text-muted hover:border-sage/40 transition-colors">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <span>{file ? file.name : "Upload .txt or .md file"}</span>
                  <input type="file" accept=".txt,.md" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
            <button type="submit" disabled={adding}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sage py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-all">
              {uploading ? <><Upload className="h-4 w-4 animate-pulse" /> Uploading...</> :
               adding ? <><Plus className="h-4 w-4" /> Adding...</> :
               <><Plus className="h-4 w-4" /> Add Resource</>}
            </button>
          </form>
          <div className="p-6">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {resources.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">No resources yet.</p>
              ) : resources.map((r, idx) => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={() => { dragSourceRef.current = idx; setDragOverIndex(idx); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                  onDrop={() => { const from = dragSourceRef.current; if (from !== null && from !== idx) handleReorder(from, idx); dragSourceRef.current = null; setDragOverIndex(null); }}
                  onDragEnd={() => { dragSourceRef.current = null; setDragOverIndex(null); }}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                    dragOverIndex === idx ? "bg-sage/10 ring-2 ring-sage/30" : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted transition-colors flex-shrink-0">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <PlayCircle className="h-5 w-5 text-sage flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate truncate">{r.title}</p>
                      <p className="text-xs text-muted">{r.category}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteResource(r.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Progress Tracker */}
        <div className="rounded-2xl bg-white border border-border shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <Users className="h-5 w-5 text-sky" />
            <h2 className="font-semibold text-slate">Student Progress</h2>
          </div>
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input type="text" placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-slate outline-none focus:border-sky transition-colors" />
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-muted">Last Active</th>
                    <th className="text-center py-3 px-2 font-medium text-muted">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-muted">
                      {searchQuery ? "No students match your search." : "No students registered."}
                    </td></tr>
                  ) : filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate">{s.name}</td>
                      <td className="py-3 px-2 text-muted">{new Date(s.lastActive).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-mint px-3 py-1 text-xs font-medium text-sage">
                          {s.modulesCompleted} modules
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
