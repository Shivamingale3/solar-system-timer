"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTimerStore } from "@/lib/store";

interface PlanetProps {
  radius: number;
  size: number;
  speed: number;
  id: string;
  texturePath?: string;
  texture?: THREE.Texture | null;
  normalPath?: string;
  specularPath?: string;
  color?: string;
  initialAngle?: number;
  children?: React.ReactNode;
}

function usePlanetLogic(
  radius: number,
  speed: number,
  initialAngle: number,
  meshRef: React.MutableRefObject<THREE.Mesh>
) {
  const status = useTimerStore((state) => state.status);
  const prevStatus = useRef(status);
  const formationTime = useRef(100); // Start completed/default
  const { setFocusedPlanet, focusedPlanetId } = useTimerStore();

  useFrame((state, delta) => {
    // Detect Start of Cycle (Idle -> Running)
    if (prevStatus.current === "idle" && status === "running") {
      formationTime.current = 0;
    }
    prevStatus.current = status;

    // Increment Formation Time
    if (status === "running" && formationTime.current < 10) {
      formationTime.current += delta;
    }

    let angle = initialAngle;
    let currentRadius = radius;
    let currentScale = 1;

    // --- BIG BANG ANIMATION ---
    // Slower formation: 3 seconds total?
    // Stagger based on radius: inner planets form first.
    // delay = radius * 0.05
    const delay = radius * 0.05;
    const progress = Math.max(
      0,
      Math.min(1, (formationTime.current - delay) / 1.5)
    );
    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);

    if (status === "running") {
      // Animate Radius out from center
      currentRadius = radius * ease;
      // Animate Scale up from 0
      currentScale = ease;

      angle += state.clock.getElapsedTime() * speed;
    } else if (status === "idle") {
      angle += state.clock.getElapsedTime() * (speed * 0.1);
    } else if (status === "completed") {
      angle += state.clock.getElapsedTime() * speed * 2;
    }

    const x = Math.sin(angle) * currentRadius;
    const z = Math.cos(angle) * currentRadius;

    if (meshRef.current) {
      meshRef.current.position.set(x, 0, z);

      // Axis rotation
      meshRef.current.rotation.y += 0.01;

      // --- BIG COLLAPSE ---
      if (status === "completed") {
        meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.02);
      } else {
        // Apply Big Bang Scale (forming)
        // We lerp to the 'currentScale' which is 1.0 (or 0 during Bang buildup)
        // But we must also update vector to match planet size?
        // logic: mesh scale is relative to its geometry. geometry is [size].
        // so we really just modulate 0->1.
        const target = status === "running" ? currentScale : 1;
        meshRef.current.scale.lerp(
          new THREE.Vector3(target, target, target),
          0.1
        );
      }
    }
  });

  return {
    onClick: (e: any) => {
      e.stopPropagation();
      setFocusedPlanet(focusedPlanetId === null ? e.object.userData.id : null);
    },
  };
}

function TexturedPlanet({
  radius,
  size,
  speed,
  color,
  texturePath,
  normalPath,
  specularPath,
  initialAngle = 0,
  id,
  children,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { setFocusedPlanet, focusedPlanetId } = useTimerStore();

  const textureMap: Record<string, string> = {};
  if (texturePath) textureMap.map = texturePath;
  if (normalPath) textureMap.normalMap = normalPath;

  const textures = useTexture(textureMap);

  usePlanetLogic(radius, speed, initialAngle, meshRef);

  return (
    <Sphere
      ref={meshRef}
      args={[size, 64, 64]}
      position={[radius, 0, 0]}
      userData={{ id }}
      onClick={(e) => {
        e.stopPropagation();
        setFocusedPlanet(focusedPlanetId === id ? null : id);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <meshStandardMaterial
        color={color || "#ffffff"}
        map={textures.map || undefined}
        normalMap={textures.normalMap || undefined}
        metalness={0.1}
        roughness={0.8}
        envMapIntensity={0.5}
      />
      {texturePath?.includes("earth") && (
        <Sphere args={[size + 0.05, 32, 32]}>
          <meshStandardMaterial
            color="#00aaff"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>
      )}
      {children}
    </Sphere>
  );
}

function SimplePlanet({
  radius,
  size,
  speed,
  color,
  initialAngle = 0,
  id,
  map, // internal prop
  children,
}: PlanetProps & { map?: THREE.Texture | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { setFocusedPlanet, focusedPlanetId } = useTimerStore();

  usePlanetLogic(radius, speed, initialAngle, meshRef);

  return (
    <Sphere
      ref={meshRef}
      args={[size, 64, 64]}
      position={[radius, 0, 0]}
      userData={{ id }}
      onClick={(e) => {
        e.stopPropagation();
        setFocusedPlanet(focusedPlanetId === id ? null : id);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <meshStandardMaterial
        color={!map ? color || "#ffffff" : "#ffffff"}
        map={map || undefined}
        metalness={0.1}
        roughness={0.8}
        envMapIntensity={0.5}
      />
      {children}
    </Sphere>
  );
}

export default function Planet(props: PlanetProps) {
  if (props.texturePath) {
    return <TexturedPlanet {...props} />;
  }
  if (props.texture) {
    return <SimplePlanet {...props} map={props.texture} />;
  }
  return <SimplePlanet {...props} />;
}
