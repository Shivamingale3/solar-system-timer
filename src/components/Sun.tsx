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

  // State tracking for animations
  const prevStatus = useRef(status);
  const flashTime = useRef(100);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Detect Start (Big Bang Ignition)
    if (prevStatus.current === "idle" && status === "running") {
      flashTime.current = 0;
    }
    prevStatus.current = status;

    if (status === "running" && flashTime.current < 10) {
      flashTime.current += 1 / 60; // Approximate delta
    }

    // Pulse/Scale Logic
    let scale = 2.5;
    let targetColor = new THREE.Color("#ffddaa");
    let targetIntensity = 2.5;

    // --- BIG BANG IGNITION ---
    if (status === "running" && flashTime.current < 2.0) {
      // First 2 seconds: IGNITION
      // 0 - 0.5s: Expansion to 5 (Flash)
      // 0.5 - 2.0s: Settle to 2.5
      const progress = flashTime.current;

      if (progress < 0.5) {
        // Explode out
        const t = progress / 0.5;
        scale = THREE.MathUtils.lerp(0.1, 6, t); // Start small, explode huge
        targetIntensity = THREE.MathUtils.lerp(0, 10, t);
        targetColor.set("#ffffff");
      } else {
        // Settle down
        const t = (progress - 0.5) / 1.5;
        scale = THREE.MathUtils.lerp(6, 2.5, t); // Shrink back to normal
        targetIntensity = THREE.MathUtils.lerp(10, 2.5, t);
        targetColor.lerp(new THREE.Color("#ffddaa"), t);
      }
    } else if (status === "running") {
      const pulse = Math.sin(time * 2) * 0.05 + 1;
      scale = 2.5 * pulse;
    } else if (status === "completed") {
      scale = 300; // Supernova expansion
      targetColor.set("#ffffff"); // Blinding white
      targetIntensity = 50; // Blinding light
    }

    // Apply Lerp to Mesh Scale
    // Use faster lerp during ignition for snap, slower for supernova
    let lerpSpeed = 0.1;
    if (status === "completed") lerpSpeed = 0.005;
    if (status === "running" && flashTime.current < 2.0) lerpSpeed = 0.2;

    meshRef.current.scale.lerp(
      new THREE.Vector3(scale, scale, scale),
      lerpSpeed
    );

    // Lerp Color if material exists
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.color.lerp(targetColor, 0.1);
    }

    // Light Intensity Ref (Cannot easily ref primitive, so we set light intensity in render but we want lerp?)
    // Actually the PointLight is updated via react props. It handles its own updates?
    // No, React Three Fiber updates props on render.
    // I need to return specific intensity.
    // I'll use a `targetIntensity` var to pass to return logic.
    // Since `targetIntensity` is calculated, I'll use that.

    // Sync Glow with Sun Scale
    const currentScale = meshRef.current.scale.x;
    if (glowRef.current) {
      glowRef.current.scale.set(currentScale * 6, currentScale * 6, 1);
      // Fade out glow sprite as real sun takes over screen
      if (status === "completed") {
        const opacity = Math.max(0, 1 - currentScale / 100);
        glowRef.current.material.opacity = opacity;
      } else {
        glowRef.current.material.opacity = 1;
      }
    }

    // Save intensity for render return (hacky via ref or state? No, render is separate).
    // The `useFrame` updates refs. The Return JSX is static unless state changes.
    // PointLight props won't update from this `useFrame` unless I force update.
    // Better: Ref the light.
    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        0.1
      );
      lightRef.current.distance = status === "completed" ? 500 : 100;
    }
  });

  const lightRef = useRef<THREE.PointLight>(null!);

  return (
    <group>
      {/* Intense Light Source */}
      <pointLight
        ref={lightRef}
        intensity={2.5}
        decay={0}
        distance={100}
        color="#ffddaa"
      />
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
