"use client";

import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

interface PlanetData {
  name: string;
  radius: string;
  distance: string;
  temp: string;
  desc: string;
}

const INFO: Record<string, PlanetData> = {
  sun: {
    name: "The Sun",
    radius: "696,340 km",
    distance: "0 AU",
    temp: "5,500°C",
    desc: "The Star of our system.",
  },
  mercury: {
    name: "Mercury",
    radius: "2,439 km",
    distance: "0.39 AU",
    temp: "167°C",
    desc: "The swiftest planet.",
  },
  venus: {
    name: "Venus",
    radius: "6,051 km",
    distance: "0.72 AU",
    temp: "464°C",
    desc: "A hot, toxic world.",
  },
  earth: {
    name: "Earth",
    radius: "6,371 km",
    distance: "1.00 AU",
    temp: "15°C",
    desc: "Our home.",
  },
  mars: {
    name: "Mars",
    radius: "3,389 km",
    distance: "1.52 AU",
    temp: "-65°C",
    desc: "The Red Planet.",
  },
  jupiter: {
    name: "Jupiter",
    radius: "69,911 km",
    distance: "5.20 AU",
    temp: "-110°C",
    desc: "The Gas Giant king.",
  },
  saturn: {
    name: "Saturn",
    radius: "58,232 km",
    distance: "9.58 AU",
    temp: "-140°C",
    desc: "The Jewel of the Solar System.",
  },
  uranus: {
    name: "Uranus",
    radius: "25,362 km",
    distance: "19.22 AU",
    temp: "-195°C",
    desc: "The Ice Giant.",
  },
  neptune: {
    name: "Neptune",
    radius: "24,622 km",
    distance: "30.05 AU",
    temp: "-200°C",
    desc: "The Windy Planet.",
  },
};

export default function PlanetHUD({ id, size }: { id: string; size: number }) {
  const data = INFO[id];
  if (!data) return null;

  // Dynamic offset based on planet size
  // Planet extends to -size. We want a bit of gap.
  const yOffset = -(size * 1.2 + 0.2);

  return (
    <Html
      as="div"
      center
      position={[0, yOffset, 0]}
      style={{ pointerEvents: "none" }}
      zIndexRange={[100, 0]}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        drag
        dragMomentum={false}
        className="flex flex-col gap-2 w-64 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-2xl cursor-grab active:cursor-grabbing pointer-events-auto"
      >
        <h2 className="text-2xl font-thin tracking-widest uppercase border-b border-white/20 pb-2 mb-1">
          {data.name}
        </h2>
        <p className="text-xs text-white/70 italic mb-2">{data.desc}</p>

        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div className="text-white/50">Radius</div>
          <div className="font-mono text-right">{data.radius}</div>

          <div className="text-white/50">Dist. Sun</div>
          <div className="font-mono text-right">{data.distance}</div>

          <div className="text-white/50">Avg. Temp</div>
          <div className="font-mono text-right">{data.temp}</div>
        </div>
      </motion.div>
    </Html>
  );
}
