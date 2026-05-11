"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingModal } from "@/components/booking-modal";
import { Chatbot } from "@/components/chatbot";
import { CalendarDays, Clock, X, MapPin, Download, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";

const COUNSELORS = [
  "Dr. Lisa Park",
  "Dr. James Carter",
  "Sarah Mitchell, LCSW",
];

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

interface BookingResult {
  id: string;
  token: string;
  date: string;
  time: string;
  counselor: string;
  createdAt: string;
}

export default function BookSession() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingResult[]>([]);
  const [lastBooking, setLastBooking] = useState<BookingResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [booking, setBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const tokenRef = useRef<HTMLDivElement>(null);

  const counselor = useMemo(
    () => COUNSELORS[Math.floor(Math.random() * COUNSELORS.length)],
    [selectedDate, selectedTime]
  );

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setBooking(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          time: selectedTime,
          counselor,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to book session");
      }

      const data = await res.json();
      const result: BookingResult = data.booking;

      setBookings((prev) => [...prev, result]);
      setLastBooking(result);
      setSelectedTime(null);
      toast.success("Session booked! Your token is ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Appointment cancelled.");
    } catch {
      toast.error("Failed to cancel appointment.");
    }
  };

  const handleSaveImage = async () => {
    if (!tokenRef.current) return;
    try {
      const dataUrl = await toPng(tokenRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `mindcare-token-${lastBooking?.token}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Token saved as image!");
    } catch {
      toast.error("Failed to save image.");
    }
  };

  const handleCopyToken = () => {
    if (!lastBooking?.token) return;
    navigator.clipboard.writeText(lastBooking.token);
    setCopied(true);
    toast.success("Token copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Navbar />

      <BookingModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmBooking}
        date={selectedDate || new Date()}
        time={selectedTime || ""}
        counselor={counselor}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate">Book a Session</h1>
            <p className="text-muted mt-1">
              Schedule a confidential one-on-one session with a licensed counselor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-border p-6 shadow-sm">
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedTime(null);
                }}
              />

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-border"
                >
                  <h3 className="font-semibold text-slate text-sm mb-3">
                    Available Times for {formatDate(selectedDate)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isBooked = bookings.some(
                        (b) =>
                          b.time === time &&
                          new Date(b.date).toDateString() === selectedDate.toDateString()
                      );
                      return (
                        <button
                          key={time}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                            isBooked
                              ? "bg-background text-muted/40 line-through cursor-not-allowed"
                              : selectedTime === time
                              ? "bg-sage text-white shadow-sm"
                              : "bg-background text-slate border border-border hover:border-sage hover:bg-mint"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center justify-between rounded-xl bg-mint px-4 py-3"
                    >
                      <div className="text-sm">
                        <span className="text-slate font-medium">
                          {formatDate(selectedDate)} at {selectedTime}
                        </span>
                        <br />
                        <span className="text-muted">with {counselor}</span>
                      </div>
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="rounded-xl bg-sage px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                      >
                        {booking ? "Booking..." : "Confirm"}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Upcoming Sessions / Token Card */}
            <div className="space-y-4">
              {lastBooking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-white border-2 border-sage/30 p-6 shadow-sm"
                >
                  <div ref={tokenRef} className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs font-medium text-sage uppercase tracking-wider mb-1">
                        Your Anonymous Token
                      </p>
                      <div className="inline-flex items-center gap-2 bg-mint rounded-xl px-4 py-3">
                        <span className="text-2xl font-bold tracking-widest text-slate font-mono">
                          {lastBooking.token}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <CalendarDays className="h-4 w-4 text-sage" />
                        {formatDate(lastBooking.date)}
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="h-4 w-4 text-sky" />
                        {lastBooking.time}
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <MapPin className="h-4 w-4 text-sky" />
                        Virtual Session
                      </div>
                      <div className="text-xs text-muted">
                        Counselor: <span className="font-medium text-slate">{lastBooking.counselor}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted text-center leading-relaxed">
                      Show this token to your counselor at the scheduled time.
                      <br />No name or identity is required.
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleCopyToken}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:bg-background transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleSaveImage}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sage py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Save Image
                    </button>
                  </div>
                </motion.div>
              )}

              {/* All booked sessions */}
              <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="h-5 w-5 text-sky" />
                  <h3 className="font-semibold text-slate">Upcoming Sessions</h3>
                </div>

                {bookings.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">
                    No upcoming sessions. Book your first session today.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl bg-background p-4 border border-border"
                      >
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-sage mb-2">
                          <span className="tracking-wider">{b.token}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate mb-2">
                          <CalendarDays className="h-4 w-4 text-sage" />
                          {formatDate(b.date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted mb-1">
                          <Clock className="h-4 w-4" />
                          {b.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted mb-3">
                          <MapPin className="h-4 w-4" />
                          Virtual Session
                        </div>
                        <div className="text-xs text-muted mb-3">
                          Counselor:{" "}
                          <span className="font-medium text-slate">{b.counselor}</span>
                        </div>
                        <button
                          onClick={() => handleCancelAppointment(b.id)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
