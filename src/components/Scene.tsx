"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Sparkles,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { useTimerStore } from "@/lib/store";
import Sun from "./Sun";
import Planet from "./Planet";
import Ring from "./Ring";
import Moon from "./Moon";
import AsteroidBelt from "./AsteroidBelt";
import OrbitPath from "./OrbitPath";
import PlanetHUD from "./PlanetHUD";
import ShootingStars from "./ShootingStars";
import Supernova from "./Supernova";
import Spacecraft from "./Spacecraft";

// Centralized Planet Config for shared logic
interface PlanetConfig {
  radius: number;
  speed: number;
  size: number;
  color: string;
  initialAngle: number;
  texturePath?: string;
  groupRotation?: [number, number, number];
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
}

const PLANET_DATA: Record<string, PlanetConfig> = {
  mercury: {
    radius: 6,
    speed: 2,
    size: 0.3,
    color: "#aaaaaa", // Fallback
    initialAngle: 0,
    texturePath: "/textures/mercury.jpg",
    groupRotation: [0, 0, Math.PI / 8],
  },
  venus: {
    radius: 8,
    speed: 1.5,
    size: 0.5,
    color: "#eecb8b",
    initialAngle: 0,
    texturePath: "/textures/venus.jpg",
    groupRotation: [0, 0, -Math.PI / 10],
  },
  earth: {
    radius: 10,
    speed: 1,
    size: 0.5,
    color: "#22aaff",
    initialAngle: 0,
    texturePath: "/textures/earth_day.jpg",
    groupRotation: [0, 0, 0],
  },
  mars: {
    radius: 12,
    speed: 0.8,
    size: 0.4,
    color: "#ff4422",
    initialAngle: 0,
    texturePath: "/textures/mars.jpg",
    groupRotation: [0, 0, Math.PI / 6],
  },
  jupiter: {
    radius: 15,
    speed: 0.4,
    size: 1.2,
    color: "#d9b38c",
    initialAngle: 0,
    texturePath: "/textures/jupiter.jpg",
    groupRotation: [0, 0, -Math.PI / 20],
  },
  saturn: {
    radius: 18,
    speed: 0.3,
    size: 1.0,
    color: "#e3e0c0",
    initialAngle: 0,
    texturePath: "/textures/saturn.jpg",
    groupRotation: [0, 0, Math.PI / 15],
    hasRing: true,
    ringInner: 1.4,
    ringOuter: 2.2,
    ringColor: "#c5c29a", // We can update this when we have a ring texture
  },
  uranus: {
    radius: 21,
    speed: 0.2,
    size: 0.8,
    color: "#a6d9f0",
    initialAngle: 0,
    texturePath: "/textures/uranus.jpg",
    groupRotation: [0, 0, -Math.PI / 12],
    hasRing: true,
    ringInner: 1.0,
    ringOuter: 1.5,
    ringColor: "#a6d9f0",
  },
  neptune: {
    radius: 24,
    speed: 0.1,
    size: 0.8,
    color: "#3355ff",
    initialAngle: 0,
    texturePath: "/textures/neptune.jpg",
    groupRotation: [0, 0, Math.PI / 10],
  },
};

function CameraController() {
  const { camera, viewport, clock } = useThree();
  const status = useTimerStore((state) => state.status);
  const focusedPlanetId = useTimerStore((state) => state.focusedPlanetId);

  useFrame((state, delta) => {
    // Responsive Distance Calculation
    // If viewport width is small (mobile), move camera further back.
    const isMobile = viewport.width < 10; // R3F viewport units
    const zBase = isMobile ? 35 : 25; // Standard viewing distance

    // Default Targets
    let targetPos =
      status === "idle"
        ? new THREE.Vector3(0, 3, isMobile ? 12 : 8)
        : new THREE.Vector3(0, 20, zBase);

    let lookAtPos = new THREE.Vector3(0, 0, 0);

    // Override if planet is focused
    if (focusedPlanetId && status !== "idle") {
      const time = clock.getElapsedTime();
      // Calculate planet position purely based on ID without ref (re-implement math)
      // Ideally we would share this math, but duplicating for camera controller is robust
      let radius = 0,
        speed = 0,
        initialAngle = 0;

      const data = PLANET_DATA[focusedPlanetId];
      if (data) {
        radius = data.radius;
        speed = data.speed * 0.1; // Reduced speed
        initialAngle = data.initialAngle;
      } else {
        // Fallbacks or special cases
      }

      let angle = initialAngle;
      if (status === "running") angle += time * speed;
      else if (status === "completed") angle += time * speed * 2;
      // In SINGLE PLANET MODE, we might want to freeze orbit or just track it?
      // User said "rotating on its own axis". Orbiting is fine if camera follows.

      const px = Math.sin(angle) * radius;
      const pz = Math.cos(angle) * radius;

      // Apply Group Rotation (Inclination) to Planet Position
      const planetPos = new THREE.Vector3(px, 0, pz);
      if (data?.groupRotation) {
        const euler = new THREE.Euler(...data.groupRotation);
        planetPos.applyEuler(euler);
      }

      // Target: Based on SIZE not RADIUS
      // We want to be close but see potential moons (Moon is at ~1.5 units from Earth)
      // distance = size * 5 gives enough context.
      const dist = (data?.size || 1) * 5.0;

      // Camera Offset relative to planet
      // We want to look at the planet from a consistent angle relative to its orbit
      // Let's position the camera *radially outward* from the sun, but close to the planet

      // Vector from Sun to Planet (normalized)
      const toPlanet = planetPos.clone().normalize();

      // Desired Camera Position: Planet Pos + (Direction * Distance)
      // We also add a slight Y offset for a "top-down" look? No, user wants "rotating on axis behind timer".
      // A flat view is better.
      const camPos = planetPos.clone().add(toPlanet.multiplyScalar(dist));

      // Lift camera slightly y so we aren't perfectly equatorial
      camPos.y += (data?.size || 0.5) * 0.5;

      targetPos = camPos;
      lookAtPos = planetPos;
    }

    camera.position.lerp(targetPos, delta * 2);
    // Smoothly interpolate lookAt? Standard lookAt is instant.
    // For smoothness, we can lerp a dummy target, but for now instant lookAt on lerped position is okay-ish.
    // Better: orbit controls target requires manual update.

    // If not using OrbitControls for this mode:
    if (focusedPlanetId) {
      const currentLook = new THREE.Vector3(0, 0, 0); // We'd need state to lerp lookAt
      camera.lookAt(lookAtPos);
    } else {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export default function Scene() {
  const status = useTimerStore((state) => state.status);
  const focusedPlanetId = useTimerStore((state) => state.focusedPlanetId);

  return (
    <div className="absolute inset-0 bg-[#020205]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={45} />
        <CameraController />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={60}
          minDistance={5}
          autoRotate={status === "idle" && !focusedPlanetId}
          autoRotateSpeed={0.5}
          enabled={!focusedPlanetId} // Disable controls when focused to allow CameraController to track cleanly
        />
        {/* Ambient surroundings - Deep Space */}
        <color attach="background" args={["#000000"]} />
        <Stars
          radius={150}
          depth={50}
          count={7000}
          factor={4}
          saturation={1}
          fade
          speed={1}
        />
        <Sparkles
          count={500}
          size={2}
          scale={[40, 40, 40]}
          opacity={0.5}
          noise={0.2}
          color="#ffffff"
        />
        {/* Main Light from Sun */}
        <ambientLight intensity={1.5} />
        {/* Subtle Environment for reflections */}
        <Environment preset="city" />
        <group>
          {(!focusedPlanetId || status === "idle") && <Sun />}
          {(!focusedPlanetId || status === "idle") && <AsteroidBelt />}
          <ShootingStars />
          <Supernova />

          <Suspense fallback={null}>
            {/* Planets & Paths */}
            {Object.entries(PLANET_DATA).map(([key, data]) => {
              const isFocused = focusedPlanetId === key;
              // If a planet is focused, hide others?
              // User wants "single planet view".
              if (focusedPlanetId && !isFocused) return null;

              return (
                <group key={key} rotation={data.groupRotation || [0, 0, 0]}>
                  {!focusedPlanetId && <OrbitPath radius={data.radius} />}
                  <Planet
                    radius={data.radius}
                    size={data.size}
                    speed={data.speed * 0.1}
                    color={data.color}
                    id={key}
                    initialAngle={data.initialAngle}
                    texturePath={data.texturePath}
                    normalPath={
                      key === "earth" ? "/textures/earth_normal.jpg" : undefined
                    }
                  >
                    {data.hasRing && (
                      <Ring
                        innerRadius={data.ringInner || 1.2}
                        outerRadius={data.ringOuter || 2}
                        color={data.ringColor}
                        rotation={[Math.PI / 2, 0, 0]}
                      />
                    )}
                    {key === "earth" && <Moon />}
                    {key === "earth" && <Spacecraft />}
                    {isFocused && <PlanetHUD id={key} size={data.size} />}
                  </Planet>
                </group>
              );
            })}
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}
