"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  date: Date;
  time: string;
  counselor: string;
}

export function BookingModal({ isOpen, onClose, onConfirm, date, time, counselor }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-border">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="font-semibold text-slate">Confirm Booking</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5 text-muted" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarDays className="h-5 w-5 text-sage flex-shrink-0" />
                  <span className="text-slate">
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-sky flex-shrink-0" />
                  <span className="text-slate">{time}</span>
                </div>
                <div className="rounded-xl bg-mint px-4 py-3">
                  <p className="text-xs text-muted mb-1">Counselor</p>
                  <p className="text-sm font-medium text-slate">{counselor}</p>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Your session is confidential. A reminder will be sent to your registered email.
                </p>
              </div>
              <div className="flex gap-3 border-t border-border px-6 py-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-sage py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
