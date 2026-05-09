"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AFFIRMATIONS = [
  "You are doing great",
  "Breathe deeply",
  "This moment is peaceful",
  "You are enough",
  "Let go of what you can't control",
  "Softness is strength",
  "You are safe",
  "Be kind to yourself",
  "Rest is productive",
  "You are not alone",
  "Every breath calms you",
  "You belong here",
  "Peace begins with you",
  "Trust the process",
  "Your feelings matter",
  "You are worthy of care",
  "Slow down, you're okay",
  "Allow yourself to heal",
  "You are stronger than you know",
  "This too shall pass",
];

const SOFT_COLORS = [
  "rgba(167, 243, 208, 0.55)",
  "rgba(196, 181, 253, 0.55)",
  "rgba(253, 230, 138, 0.55)",
  "rgba(196, 215, 255, 0.55)",
  "rgba(244, 197, 237, 0.55)",
  "rgba(153, 246, 228, 0.55)",
  "rgba(254, 202, 202, 0.55)",
  "rgba(191, 219, 254, 0.55)",
];

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function playChime(context: AudioContext | null, freq: number, time: number) {
  if (!context) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.1);
  gain.gain.setValueAtTime(0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(time);
  osc.stop(time + 0.8);
}

export default function BubblePop() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [affirmationKey, setAffirmationKey] = useState(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === "suspended") {
      audioCtx.current.resume();
    }
    return audioCtx.current;
  }, []);

  const createBubble = useCallback((): Bubble => {
    const size = 60 + Math.random() * 80;
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * 85 + 5,
      y: 100 + Math.random() * 30,
      size,
      color: SOFT_COLORS[Math.floor(Math.random() * SOFT_COLORS.length)],
      duration: 6 + Math.random() * 5,
      delay: Math.random() * 3,
    };
  }, []);

  const spawnBubbles = useCallback((count: number) => {
    setBubbles(Array.from({ length: count }, createBubble));
  }, [createBubble]);

  useEffect(() => {
    spawnBubbles(10);
  }, [spawnBubbles]);

  const popBubble = useCallback((id: number) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playChime(ctx, 440 + Math.random() * 220, now);
    playChime(ctx, 330 + Math.random() * 110, now + 0.12);

    setBubbles((prev) => prev.filter((b) => b.id !== id));

    const msg = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(msg);
    setAffirmationKey((k) => k + 1);

    setTimeout(() => {
      setBubbles((prev) => {
        if (prev.length < 6) return [...prev, createBubble()];
        return prev;
      });
    }, 600);
  }, [getAudioContext, createBubble]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl cursor-pointer"
      style={{
        background: "linear-gradient(180deg, #f0fdf4 0%, #e0f2fe 50%, #f5f3ff 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-200 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-blue-200 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-52 h-52 bg-purple-200 rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0.3, x: `${bubble.x}vw`, y: "110%" }}
            animate={{
              opacity: [0.6, 0.9, 0.6],
              scale: [0.9, 1.05, 0.9],
              x: [
                `${bubble.x}vw`,
                `${bubble.x + (Math.random() - 0.5) * 10}vw`,
                `${bubble.x}vw`,
              ],
              y: ["80%", "10%", "-15%"],
            }}
            exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.25 } }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={(e) => {
              e.stopPropagation();
              popBubble(bubble.id);
            }}
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${bubble.color.replace("0.55", "0.75")}, ${bubble.color})`,
              boxShadow: `0 4px 20px ${bubble.color.replace("0.55", "0.25")}`,
              backdropFilter: "blur(2px)",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "12%",
                left: "20%",
                width: "30%",
                height: "20%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
                transform: "rotate(-30deg)",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {affirmation && (
          <motion.div
            key={affirmationKey}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            onAnimationComplete={() => {
              setTimeout(() => setAffirmation(null), 2500);
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="bg-white/75 backdrop-blur-md rounded-2xl px-8 py-5 shadow-lg border border-white/40 max-w-sm text-center">
              <p className="text-lg font-semibold text-slate-700 leading-relaxed">
                {affirmation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <p className="text-xs text-muted-foreground/50 text-center">
          Tap the bubbles to pop them
        </p>
      </div>
    </div>
  );
}
