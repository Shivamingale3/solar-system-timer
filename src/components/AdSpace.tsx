"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AdSpace() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Safety check: ensure window exists and we haven't already pushed too many
    if (visible && typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
      <div className="relative w-[300px] h-[250px] bg-black/40 backdrop-blur-md border border-white/10 rounded-lg flex flex-col items-center justify-center text-center overflow-hidden">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1 right-1 p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors z-30"
        >
          <X size={12} />
        </button>

        <span className="absolute top-1 left-2 text-[10px] uppercase tracking-widest text-white/30 mb-1 z-30">
          Advertisement
        </span>

        {/* AdSense Unit */}
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "300px", height: "250px" }}
          data-ad-client="ca-pub-2454134193807389"
          data-ad-slot="2168215915"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
