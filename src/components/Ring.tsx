"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface RingProps {
  innerRadius: number;
  outerRadius: number;
  rotation?: [number, number, number];
  texturePath?: string;
  color?: string;
}

export default function Ring({
  innerRadius,
  outerRadius,
  rotation = [Math.PI / 2, 0, 0], // Default flat
  texturePath,
  color = "#ffffff",
}: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Optional texture
  // const texture = texturePath ? useTexture(texturePath) : null;
  // For now, procedural basic ring with colors is fine or we can add noise later.
  // We'll use a simple colored ring for now to avoid 404s.

  useFrame(() => {
    if (meshRef.current) {
      // Slowly rotate ring? Usually rings spin with planet.
      // Doing nothing here means it rotates with parent group if grouped.
    }
  });

  return (
    <mesh ref={meshRef} rotation={rotation}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}
