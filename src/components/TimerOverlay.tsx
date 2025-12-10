"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Helper to format SS to HH:MM:SS
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
};

const formatDisplay = (val: number) => val.toString().padStart(2, "0");

export default function TimerOverlay() {
  const {
    status,
    remainingTime,
    duration,
    setDuration,
    startTimer,
    resetTimer,
    pauseTimer,
    tick,
  } = useTimerStore();

  // Local state for inputs
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  // Sync Input to Store Duration
  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    setDuration(total > 0 ? total : 0);
  }, [hours, minutes, seconds, setDuration]);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "running") {
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  const { h, m, s } = formatTime(remainingTime);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 text-white font-mono">
      {/* Title / Header */}
      <h1 className="absolute top-8 text-xs md:text-sm tracking-[0.3em] uppercase opacity-50">
        Cosmic Timer
      </h1>

      {/* IDLE STATE: Inputs */}
      <AnimatePresence>
        {status === "idle" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-auto bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4 text-center">
              <TimeInput label="Hours" value={hours} onChange={setHours} />
              <span className="text-2xl mt-4">:</span>
              <TimeInput
                label="Minutes"
                value={minutes}
                onChange={setMinutes}
              />
              <span className="text-2xl mt-4">:</span>
              <TimeInput
                label="Seconds"
                value={seconds}
                onChange={setSeconds}
              />
            </div>

            <button
              onClick={startTimer}
              disabled={duration === 0}
              className="group relative px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="flex items-center gap-2 uppercase tracking-widest text-sm font-bold">
                <Play size={16} fill="currentColor" /> Ignite
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RUNNING / PAUSED / COMPLETED STATE: Big Countdown */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center pointer-events-auto"
          >
            {/* Main HUD Display */}
            <div className="text-6xl md:text-8xl font-thin tracking-wider flex gap-2 mix-blend-difference">
              <span>{formatDisplay(h)}</span>
              <span className="opacity-50">:</span>
              <span>{formatDisplay(m)}</span>
              <span className="opacity-50">:</span>
              <span>{formatDisplay(s)}</span>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              {status !== "completed" && (
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
              )}
              {status === "completed" && (
                <button
                  onClick={resetTimer}
                  className="px-6 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                >
                  Reset System
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-xs uppercase tracking-wider opacity-60">
        {label}
      </label>
      <input
        type="number"
        min={0}
        max={label === "Hours" ? 99 : 59}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-16 h-16 bg-transparent border border-white/20 rounded-xl text-center text-3xl focus:outline-none focus:border-white/50 transition-colors"
      />
    </div>
  );
}
