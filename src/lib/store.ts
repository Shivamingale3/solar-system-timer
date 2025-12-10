import { create } from "zustand";

type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerState {
  duration: number; // Total duration in seconds
  remainingTime: number; // Remaining seconds
  status: TimerStatus;
  focusedPlanetId: string | null; // Planet ID

  // Actions
  setDuration: (seconds: number) => void;
  setFocusedPlanet: (id: string | null) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  duration: 60, // Default 1 minute
  remainingTime: 60,
  status: "idle",
  focusedPlanetId: null,

  setDuration: (seconds) => set({ duration: seconds, remainingTime: seconds }),
  setFocusedPlanet: (id) => set({ focusedPlanetId: id }),

  startTimer: () => set({ status: "running" }),

  pauseTimer: () => set({ status: "paused" }),

  resetTimer: () => {
    const { duration } = get();
    set({ remainingTime: duration, status: "idle" });
  },

  tick: () => {
    const { remainingTime, status, resetTimer } = get();

    if (status !== "running") return;

    if (remainingTime > 0) {
      set({ remainingTime: remainingTime - 1 });
    } else {
      set({ status: "completed" });
    }
  },
}));
