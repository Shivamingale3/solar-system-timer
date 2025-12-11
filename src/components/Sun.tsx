"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { Sphere, useTexture, shaderMaterial } from "@react-three/drei";
import { useTimerStore } from "@/lib/store";
import * as THREE from "three";

// Custom Shader for Atmosphere Glow
const AtmosphereMaterial = shaderMaterial(
  {
    color: new THREE.Color(1.0, 0.4, 0.0), // Deep Orange/Red
    viewVector: new THREE.Vector3(0, 0, 0),
    intensity: 1.0,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vNormal;
    void main() {
      // Standard Fresnel: 1.0 - dot(view, normal)
      // vNormal is in View Space, so (0,0,1) is roughly "towards camera"
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float viewDot = dot(vNormal, viewDir);
      float glow = pow(0.7 - viewDot, 2.0); 
      // Using 0.7 offset to pull the glow slightly inward, adjusting power for falloff
      // Clamp to minimal 0 to avoid artifacts
      glow = max(0.0, glow);
      
      gl_FragColor = vec4(color, glow * intensity);
    }
  `
);

extend({ AtmosphereMaterial });

// Add types for the custom material
declare module "@react-three/fiber" {
  interface ThreeElements {
    atmosphereMaterial: any;
  }
}

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
  const atmosphereRef = useRef<THREE.Mesh>(null!);

  const status = useTimerStore((state) => state.status);
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

    // Sync Glow/Atmosphere with Sun Scale
    const currentScale = meshRef.current.scale.x;
    if (glowRef.current)
      glowRef.current.scale.set(currentScale * 6, currentScale * 6, 1);
    if (atmosphereRef.current)
      atmosphereRef.current.scale.set(
        currentScale * 1.3,
        currentScale * 1.3,
        currentScale * 1.3
      );
  });

  return (
    <group>
      {/* Intense Light Source */}
      <pointLight intensity={2.5} decay={0} distance={100} color="#ffddaa" />
      <ambientLight intensity={0.5} />

      {/* 1. Main Sun Body - textured */}
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
        <meshBasicMaterial map={sunTexture} color="#ffffff" />
      </Sphere>

      {/* 2. Atmosphere Glow (Fresnel Shader) */}
      {/* Slightly larger than sun */}
      <Sphere ref={atmosphereRef} args={[1, 64, 64]} scale={3.0}>
        <atmosphereMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.FrontSide}
          color={new THREE.Color("#ff6600")}
          intensity={2.0}
        />
      </Sphere>

      {/* 3. Billboard Shine (Sprite) */}
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
