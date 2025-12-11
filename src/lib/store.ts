import { create } from "zustand";

type TimerStatus = "idle" | "running" | "paused" | "completed";

interface TimerState {
  duration: number; // Total duration in seconds
  remainingTime: number; // Remaining seconds
  status: TimerStatus;
  focusedPlanetId: string | null; // Planet ID
  endTime: number | null; // Target end timestamp
  zoomDirection: number; // -1 (out), 0 (none), 1 (in)

  // Actions
  setDuration: (seconds: number) => void;
  setFocusedPlanet: (id: string | null) => void;
  setZoomDirection: (dir: number) => void;
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
  endTime: null,
  zoomDirection: 0,

  setDuration: (seconds) => set({ duration: seconds, remainingTime: seconds }),
  setFocusedPlanet: (id) => set({ focusedPlanetId: id }),
  setZoomDirection: (dir) => set({ zoomDirection: dir }),

  startTimer: () => {
    const { remainingTime } = get();
    const endTime = Date.now() + remainingTime * 1000;
    set({ status: "running", endTime });
  },

  pauseTimer: () => set({ status: "paused", endTime: null }),

  resetTimer: () => {
    const { duration } = get();
    set({ remainingTime: duration, status: "idle", endTime: null });
  },

  tick: () => {
    const { endTime, status } = get();

    if (status !== "running" || !endTime) return;

    const msLeft = endTime - Date.now();
    const secondsLeft = Math.ceil(msLeft / 1000);

    if (secondsLeft <= 0) {
      set({ remainingTime: 0, status: "completed", endTime: null });
    } else {
      set({ remainingTime: secondsLeft });
    }
  },
}));
