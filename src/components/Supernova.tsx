"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTimerStore } from "@/lib/store";

export default function Supernova() {
  const status = useTimerStore((state) => state.status);
  const isCompleted = status === "completed";

  const shockwaveRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);

  // Particle Data
  const particleCount = 2000;
  const particles = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Start mainly at center
      const r = Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Velocity outward
      const speed = 0.2 + Math.random() * 0.5;
      vel[i * 3] = (pos[i * 3] / (r || 0.001)) * speed;
      vel[i * 3 + 1] = (pos[i * 3 + 1] / (r || 0.001)) * speed;
      vel[i * 3 + 2] = (pos[i * 3 + 2] / (r || 0.001)) * speed;
    }
    return { pos, vel };
  }, []);

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setActive(true);
      // Reset Logic handled partly by component mount lifecycle if conditionally rendered
      // But if always mounted, we need to reset transforms
    } else {
      setActive(false);
    }
  }, [isCompleted]);

  useFrame((state, delta) => {
    if (!active) return;

    // Animate Shockwave
    if (shockwaveRef.current) {
      const s = shockwaveRef.current.scale.x + delta * 30; // Fast expansion
      shockwaveRef.current.scale.setScalar(s);

      // Fade out
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      if (mat.opacity > 0) mat.opacity -= delta * 0.5;
    }

    // Animate Particles
    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      const positions = geo.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particles.vel[i * 3] * delta * 15; // Move fast
        positions[i * 3 + 1] += particles.vel[i * 3 + 1] * delta * 15;
        positions[i * 3 + 2] += particles.vel[i * 3 + 2] * delta * 15;
      }
      geo.attributes.position.needsUpdate = true;

      // Rotate system
      particlesRef.current.rotation.y += delta * 0.2;
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Shockwave Sphere */}
      <mesh ref={shockwaveRef} scale={[0.1, 0.1, 0.1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary Shockwave */}
      <mesh scale={[0.1, 0.1, 0.1]}>
        {/* Using a key to enforce re-mount for animation reset relative to parent scale? 
                Actually simple useFrame scaler is enough 
             */}
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.pos, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          color="#ffcc88"
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.8}
        />
      </points>

      {/* Bright Flash Light */}
      <pointLight intensity={10} distance={100} color="#ffaa55" decay={2} />
    </group>
  );
}
