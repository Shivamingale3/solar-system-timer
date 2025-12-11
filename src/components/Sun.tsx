"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, useTexture } from "@react-three/drei";
import { useTimerStore } from "@/lib/store";
import * as THREE from "three";
import PlanetHUD from "./PlanetHUD";

// Custom Shader removed as per user request (red bubble effect)

// Helper to create a radial gradient texture for the sprite
function createGlowTexture() {
  if (typeof document === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 200, 100, 0.5)"); // More transparent for softer shine
    gradient.addColorStop(0.5, "rgba(255, 100, 0, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);

  const status = useTimerStore((state) => state.status);
  const { setFocusedPlanet, focusedPlanetId } = useTimerStore();
  const sunTexture = useTexture("/textures/sun.jpg");

  // Generate Sprite Texture once
  const glowTexture = useMemo(() => createGlowTexture(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse/Scale Logic
    let scale = 2.5;
    if (status === "running") {
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      scale = 2.5 * pulse;
    } else if (status === "completed") {
      scale = 15; // Target size, will lerp
    }

    // Apply Lerp to Mesh
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

    // Sync Glow with Sun Scale
    const currentScale = meshRef.current.scale.x;
    if (glowRef.current)
      glowRef.current.scale.set(currentScale * 6, currentScale * 6, 1);
  });

  return (
    <group>
      {/* Intense Light Source */}
      <pointLight intensity={2.5} decay={0} distance={100} color="#ffddaa" />
      <ambientLight intensity={0.5} />

      {/* 1. Main Sun Body - textured */}
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        scale={2.5}
        onClick={(e) => {
          e.stopPropagation();
          setFocusedPlanet(focusedPlanetId === "sun" ? null : "sun");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <meshBasicMaterial map={sunTexture} color="#ffffff" />
        {focusedPlanetId === "sun" && <PlanetHUD id="sun" size={2.5} />}
      </Sphere>

      {/* 2. Billboard Shine (Sprite) */}
      <sprite ref={glowRef} scale={[12, 12, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}
