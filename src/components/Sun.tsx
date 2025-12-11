"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, useTexture } from "@react-three/drei";
import { useTimerStore } from "@/lib/store";
import * as THREE from "three";

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const status = useTimerStore((state) => state.status);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse/Scale Logic
    if (status === "running") {
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      meshRef.current.scale.setScalar(2.5 * pulse);
    } else if (status === "completed") {
      meshRef.current.scale.lerp(new THREE.Vector3(15, 15, 15), 0.05);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(2.5, 2.5, 2.5), 0.1);
    }
  });

  return (
    <group>
      {/* Intense Light Source */}
      <pointLight intensity={2} decay={0} distance={100} color="#ffddaa" />
      <ambientLight intensity={0.2} />

      {/* Main Sun Body - textured */}
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <meshBasicMaterial map={useTexture("/textures/sun.jpg")} color="#ffffff" />
      </Sphere>

      {/* Glow Halo - Inner */}
      <Sphere args={[1.2, 32, 32]} scale={2.5}>
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Glow Halo - Outer */}
      <Sphere args={[1.5, 32, 32]} scale={2.5}>
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}
