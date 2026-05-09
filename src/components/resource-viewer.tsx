"use client";

import { useRef, useState, useEffect } from "react";
import { X, ArrowLeft, Film, Headphones, FileText, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Resource } from "@/lib/types";

const categoryIcons: Record<string, React.ReactNode> = {
  Video: <Film className="h-5 w-5" />,
  Audio: <Headphones className="h-5 w-5" />,
  Article: <FileText className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  Video: "bg-blue-50 text-blue-600",
  Audio: "bg-purple-50 text-purple-600",
  Article: "bg-amber-50 text-amber-600",
};

interface Props {
  resource: Resource | null;
  onClose: () => void;
}

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-4" />;
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl font-semibold text-slate mt-6 mb-3">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }
    return (
      <p key={i} className="text-base leading-relaxed text-slate/80 mb-3">
        {trimmed}
      </p>
    );
  });
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AmbientGenerator({ isPlaying, onReady }: { isPlaying: boolean; onReady: () => void }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  useEffect(() => {
    if (isPlaying) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.3;
      master.connect(ctx.destination);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain);
      lfo.start();

      const drone1 = ctx.createOscillator();
      drone1.type = "sine";
      drone1.frequency.value = 80;
      const drone1Gain = ctx.createGain();
      drone1Gain.gain.value = 0.4;
      lfoGain.connect(drone1Gain.gain);
      drone1.connect(drone1Gain);
      drone1Gain.connect(master);
      drone1.start();

      const drone2 = ctx.createOscillator();
      drone2.type = "sine";
      drone2.frequency.value = 120;
      const drone2Gain = ctx.createGain();
      drone2Gain.gain.value = 0.2;
      drone2.connect(drone2Gain);
      drone2Gain.connect(master);
      drone2.start();

      const drone3 = ctx.createOscillator();
      drone3.type = "sine";
      drone3.frequency.value = 200;
      const drone3Gain = ctx.createGain();
      drone3Gain.gain.value = 0.1;
      drone3.connect(drone3Gain);
      drone3Gain.connect(master);
      drone3.start();

      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / ctx.sampleRate) * Math.PI * 0.5);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 400;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.15;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      nodesRef.current = [drone1, drone2, drone3, noise, lfo, master, drone1Gain, drone2Gain, drone3Gain, noiseFilter, noiseGain, lfoGain];
      onReady();
    }

    return () => {
      nodesRef.current.forEach((n) => {
        try { (n as AudioScheduledSourceNode).stop?.(); } catch {}
        try { n.disconnect?.(); } catch {}
      });
      nodesRef.current = [];
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [isPlaying, onReady]);

  return null;
}

function AudioPlayer({ resource }: { resource: Resource }) {
  const hasFile = !!resource.audioUrl;

  if (hasFile) {
    return <AudioFilePlayer url={resource.audioUrl!} body={resource.body} title={resource.title} />;
  }
  return <AmbientFallbackPlayer body={resource.body} title={resource.title} />;
}

function AudioFilePlayer({ url, body, title }: { url: string; body?: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { if (a) setCurrentTime(a.currentTime); };
    const onMeta = () => { if (a && isFinite(a.duration)) { setDuration(a.duration); setIsReady(true); setHasError(false); } };
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0); };
    const onErr = () => { setHasError(true); setIsPlaying(false); setIsReady(false); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onErr);
    };
  }, []);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a || hasError) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      try { await a.play(); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    a.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <audio ref={audioRef} src={url} preload="auto" />
      {hasError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
          Audio failed to load.
        </div>
      )}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center">
        <div
          className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-6 cursor-pointer hover:from-purple-200 hover:to-purple-100 transition-colors"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-10 w-10 text-purple-600 ml-0" /> : <Play className="h-10 w-10 text-purple-600 ml-1" />}
        </div>
        <h3 className="text-lg font-semibold text-slate mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">
          {!isReady ? "Loading..." : isPlaying ? "Now playing — close your eyes and breathe deeply" : "Tap play to begin"}
        </p>
        <div className="mx-auto max-w-sm">
          <div className="h-2 rounded-full bg-mint overflow-hidden mb-2 cursor-pointer" onClick={handleSeek}>
            <div className="h-full rounded-full bg-gradient-to-r from-sage to-emerald-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
          <button onClick={togglePlay} disabled={!isReady} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-background transition-colors disabled:opacity-50">
            {isPlaying ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Play</>}
          </button>
        </div>
        {body && (
          <div className="mt-8 pt-6 border-t border-border text-left">
            <p className="text-sm leading-relaxed text-slate/70 whitespace-pre-line">{body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AmbientFallbackPlayer({ body, title }: { body?: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenReady, setIsGenReady] = useState(false);
  const duration = 180;
  const tickRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (isPlaying && isGenReady) {
      startRef.current = Date.now();
      const tick = () => {
        const elapsed = (Date.now() - startRef.current) / 1000;
        if (elapsed >= duration) { setCurrentTime(0); setIsPlaying(false); return; }
        setCurrentTime(elapsed);
        tickRef.current = requestAnimationFrame(tick);
      };
      tickRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(tickRef.current);
  }, [isPlaying, isGenReady, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); }
    else { setIsGenReady(false); setCurrentTime(0); setIsPlaying(true); }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <AmbientGenerator isPlaying={isPlaying} onReady={() => setIsGenReady(true)} />
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center">
        <div className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 mb-6 cursor-pointer hover:from-purple-200 hover:to-purple-100 transition-colors" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-10 w-10 text-purple-600 ml-0" /> : <Play className="h-10 w-10 text-purple-600 ml-1" />}
        </div>
        <h3 className="text-lg font-semibold text-slate mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">
          {isPlaying ? "Now playing — close your eyes and breathe deeply" : "Tap play to begin"}
        </p>
        <div className="mx-auto max-w-sm">
          <div className="h-2 rounded-full bg-mint overflow-hidden mb-2 cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
            if (isPlaying) { startRef.current = Date.now() - seekTime * 1000; setCurrentTime(seekTime); }
          }}>
            <div className="h-full rounded-full bg-gradient-to-r from-sage to-emerald-400" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        {body && (
          <div className="mt-8 pt-6 border-t border-border text-left">
            <p className="text-sm leading-relaxed text-slate/70 whitespace-pre-line">{body}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResourceViewer({ resource, onClose }: Props) {
  if (!resource) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-4 sm:inset-6 md:inset-8 lg:inset-12 z-50 flex flex-col rounded-2xl bg-white shadow-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-slate" />
            </button>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate text-base truncate">
                {resource.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[resource.category]}`}
            >
              {categoryIcons[resource.category]}
              {resource.category}
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-background transition-colors"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#fafaf9]">
          {resource.category === "Article" && resource.body && (
            <div className="mx-auto max-w-2xl px-6 py-8">
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
                <div className="prose prose-slate max-w-none">
                  {renderBody(resource.body)}
                </div>
              </div>
            </div>
          )}

          {resource.category === "Video" && resource.embedUrl && (
            <div className="mx-auto max-w-4xl px-6 py-8">
              <div className="rounded-2xl overflow-hidden shadow-sm border border-border bg-black aspect-video">
                <iframe
                  src={resource.embedUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {resource.body && (
                <div className="mt-6 bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <p className="text-base leading-relaxed text-slate/80 whitespace-pre-line">
                    {resource.body}
                  </p>
                </div>
              )}
            </div>
          )}

          {resource.category === "Audio" && <AudioPlayer resource={resource} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
