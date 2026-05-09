"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingModal } from "@/components/booking-modal";
import { Chatbot } from "@/components/chatbot";
import { CalendarDays, Clock, X, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const COUNSELORS = [
  "Dr. Lisa Park",
  "Dr. James Carter",
  "Sarah Mitchell, LCSW",
];

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

interface Appointment {
  id: string;
  date: Date;
  time: string;
  counselor: string;
}

export default function BookSession() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "a1",
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2),
      time: "10:00 AM",
      counselor: "Dr. Lisa Park",
    },
  ]);
  const [showConfirm, setShowConfirm] = useState(false);

  const counselor = useMemo(
    () => COUNSELORS[Math.floor(Math.random() * COUNSELORS.length)],
    [selectedDate, selectedTime]
  );

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) return;
    const newAppt: Appointment = {
      id: `a${Date.now()}`,
      date: selectedDate,
      time: selectedTime,
      counselor,
    };
    setAppointments((prev) => [...prev, newAppt]);
    setSelectedTime(null);
    toast.success("Session booked successfully!");
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Appointment cancelled.");
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

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
                      const booked = appointments.some(
                        (a) =>
                          a.time === time &&
                          a.date.toDateString() === selectedDate.toDateString()
                      );
                      return (
                        <button
                          key={time}
                          disabled={booked}
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                            booked
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
                        Confirm
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="rounded-2xl bg-white border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-sky" />
                <h3 className="font-semibold text-slate">Upcoming Sessions</h3>
              </div>

              {appointments.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  No upcoming sessions. Book your first session today.
                </p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-xl bg-background p-4 border border-border"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-slate mb-2">
                        <CalendarDays className="h-4 w-4 text-sage" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted mb-1">
                        <Clock className="h-4 w-4" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted mb-3">
                        <MapPin className="h-4 w-4" />
                        Virtual Session
                      </div>
                      <div className="text-xs text-muted mb-3">
                        Counselor:{" "}
                        <span className="font-medium text-slate">{apt.counselor}</span>
                      </div>
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
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
        </motion.div>
      </main>

      <Chatbot />
    </div>
  );
}
