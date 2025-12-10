"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Spacecraft() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Orbit rotation (local)
      // It's inside a group that positions it relative to Earth
      // We can add some local wobble or rotation
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={[0, 0, Math.PI / 4]}
      position={[0.8, 0.1, 0]}
    >
      {/* Main Body */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
        <meshStandardMaterial color="#eeeeee" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Solar Panels */}
      {/* Left */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.05]} />
        <meshStandardMaterial
          color="#3366cc"
          metalness={0.5}
          roughness={0.3}
          emissive="#112244"
        />
      </mesh>
      {/* Right */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.05]} />
        <meshStandardMaterial
          color="#3366cc"
          metalness={0.5}
          roughness={0.3}
          emissive="#112244"
        />
      </mesh>

      {/* Cross beam */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.25, 8]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  );
}
