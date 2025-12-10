"use client";

import { useTexture, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Moon() {
  const meshRef = useRef<THREE.Mesh>(null!);
  // const texture = useTexture("/textures/moon.jpg"); // We can add this texture later or rely on color

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Only if we need independent rotation
    }
  });

  return (
    // Group to handle orbit offset?
    // If Planet rotates Y, this child will orbit.
    // If we want a different orbit speed, we need to wrap this in a group that counter-rotates or rotates faster.
    // For now, let's just place it.
    <group rotation={[0, 0, Math.PI / 8]}>
      {/* Inclined moon orbit */}
      <Sphere args={[0.12, 32, 32]} position={[1.5, 0, 0]}>
        <meshStandardMaterial color="#dddddd" roughness={0.8} metalness={0.1} />
      </Sphere>
    </group>
  );
}
