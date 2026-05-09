"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, AlertTriangle } from "lucide-react";

const HELPLINES = [
  { name: "Nagpur Suicide Prevention Helpline", number: "1800-123-4567", hours: "24/7" },
  { name: "Nagpur Mental Health Support", number: "0712-256-7890", hours: "8:00 AM – 8:00 PM" },
  { name: "Vandrevala Foundation Helpline", number: "1860-266-2345", hours: "24/7" },
  { name: "iCall Psychosocial Helpline", number: "022-2556-3291", hours: "Mon–Sat, 8 AM–10 PM" },
  { name: "NIMHANS Emergency Helpline", number: "080-2650-0050", hours: "24/7" },
];

export default function EmergencySOS() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(false), []);

  const btn = (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm"
      title="Emergency Help"
    >
      <AlertTriangle className="h-4 w-4" />
      <span className="hidden sm:inline">SOS</span>
    </button>
  );

  const modal = mounted && createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sos-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <motion.div
            key="sos-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-amber-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Emergency Help</h2>
                    <p className="text-sm text-white/80">Nagpur Helpline Numbers</p>
                  </div>
                </div>
                <button onClick={close} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-muted mb-1">
                If you are in immediate danger, please call one of these helplines right away.
              </p>
              {HELPLINES.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
                  className={`flex items-center justify-between rounded-xl p-3.5 transition-colors ${
                    i === 0
                      ? "bg-red-50 hover:bg-red-100 border border-red-100"
                      : "bg-background hover:bg-mint/30 border border-border"
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${i === 0 ? "text-red-700" : "text-slate"}`}>{h.name}</p>
                    <p className="text-xs text-muted mt-0.5">{h.hours}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${i === 0 ? "bg-red-500 text-white" : "bg-sage text-white"}`}>
                    <Phone className="h-3 w-3" />
                    {h.number}
                  </div>
                </a>
              ))}
              <p className="text-[10px] text-muted text-center pt-1">
                You are not alone. Help is available.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {btn}
      {modal}
    </>
  );
}
