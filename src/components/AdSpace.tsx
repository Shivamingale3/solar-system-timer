"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AdSpace() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
      <div className="relative w-64 h-24 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex flex-col items-center justify-center text-center p-4">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1 right-1 p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>

        <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
          Advertisement
        </span>

        {/* Actual Ad Code would go here */}
        <div className="text-white/80 text-xs font-mono">
          Place Google AdSense <br /> or Carbon Ad Here
        </div>
      </div>
    </div>
  );
}
