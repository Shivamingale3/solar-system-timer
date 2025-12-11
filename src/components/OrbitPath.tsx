"use client";

import * as THREE from "three";
import { useTimerStore } from "@/lib/store";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function OrbitPath({ radius }: { radius: number }) {
  const status = useTimerStore((state) => state.status);
  const lineRef = useRef<THREE.LineLoop>(null!);
  const prevStatus = useRef(status);
  const formationTime = useRef(100);

  // Big Bang Expansion
  useFrame((state, delta) => {
    // Detect Start
    if (prevStatus.current === "idle" && status === "running") {
      formationTime.current = 0;
    }
    prevStatus.current = status;

    if (status === "running" && formationTime.current < 10) {
      formationTime.current += delta;
    }

    // Reuse delay logic for consistency
    const delay = radius * 0.05;
    const progress = Math.max(
      0,
      Math.min(1, (formationTime.current - delay) / 1.5)
    );
    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);

    if (lineRef.current) {
      if (status === "running") {
        lineRef.current.scale.setScalar(ease);
      } else {
        lineRef.current.scale.setScalar(1);
      }
    }
  });

  // Collapse: Hide orbits
  if (status === "completed") return null;

  // Using a simple LineLoop geometry for a super thin, crisp line
  // "Ring" from Drei is a mesh, which can look thick.
  // Native THREE.Line with BufferGeometry is best for "hairline" orbits.

  const points = [];
  const divisions = 64;
  for (let i = 0; i <= divisions; i++) {
    const angle = (i / divisions) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Create the line object once
  const line = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    })
  );

  return <primitive object={line} ref={lineRef} />;
}
