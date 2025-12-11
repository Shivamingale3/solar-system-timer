"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Sparkles,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
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
  const { camera, controls } = useThree() as any; // Cast to any to access controls from makeDefault
  const focusedPlanetId = useTimerStore((state) => state.focusedPlanetId);
  const status = useTimerStore((state) => state.status);
  const cameraResetVersion = useTimerStore((state) => state.cameraResetVersion);

  const prevFocusRef = useRef<string | null>(null);
  const prevResetVersionRef = useRef<number>(0);
  const transitionTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  // Detect Focus Change
  if (prevFocusRef.current !== focusedPlanetId) {
    prevFocusRef.current = focusedPlanetId;
    isTransitioningRef.current = true;
    transitionTimeRef.current = 0;
  }

  // Detect Reset Trigger
  if (prevResetVersionRef.current !== cameraResetVersion) {
    prevResetVersionRef.current = cameraResetVersion;
    isTransitioningRef.current = true;
    transitionTimeRef.current = 0;
  }

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Determine Target Focus Position (Planet or Sun)
    let lookAtPos = new THREE.Vector3(0, 0, 0); // Default Sun
    let desiredDist = 40; // Default distance for overview

    if (focusedPlanetId) {
      const data = PLANET_DATA[focusedPlanetId];
      if (data) {
        let angle = data.initialAngle;
        let radius = data.radius;
        let speed = data.speed * 0.1;

        // Calculate Planet Position (Same logic as rendering loop to stay synced)
        if (status === "running") {
          angle += time * speed;
        } else if (status === "idle") {
          angle += time * (speed * 0.1);
        } else if (status === "completed") {
          angle += time * speed * 2;
        }

        const px = Math.sin(angle) * radius;
        const pz = Math.cos(angle) * radius;
        const planetPos = new THREE.Vector3(px, 0, pz);

        if (data.groupRotation) {
          const euler = new THREE.Euler(...data.groupRotation);
          planetPos.applyEuler(euler);
        }

        lookAtPos = planetPos;
        desiredDist = (data.size || 1) * 5.0;
      }
    }

    // 2. Update Controls Target (Follow the object)
    if (controls) {
      // Smoothly move the controls target to the new lookAtPos
      // This allows the camera to "orbit" the moving planet
      controls.target.lerp(lookAtPos, 0.1);

      // Update controls to apply the new target and any user inputs
      controls.update();
    }

    // 3. Handle One-Time Transition (Fly-to)
    // When focus changes, we force-move the camera for a set time, then release control
    if (isTransitioningRef.current) {
      transitionTimeRef.current += delta;

      // Calculate Ideal Camera Position for the Fly-to
      // We want to be at 'desiredDist' away from the target
      // Preserving current direction if possible, or defaulting to a side view

      // Current vector from target to camera
      const offset = camera.position.clone().sub(lookAtPos);

      // If we are too close or too far, or just starting, we normalize to desired distance
      // But we want to animate INTO this position.

      let targetCamPos: THREE.Vector3;

      if (focusedPlanetId) {
        // Fly to a nice side view of the planet
        // We can offset by [0, data.size, desiredDist] relative to planet
        // But simplest is just zooming in along current vector or a default vector
        const viewDir = offset.clone().normalize();
        if (viewDir.lengthSq() < 0.1) viewDir.set(0, 0.5, 1).normalize(); // Handle zero length

        targetCamPos = lookAtPos
          .clone()
          .add(viewDir.multiplyScalar(desiredDist));
      } else {
        // Fly back to Overview
        targetCamPos = new THREE.Vector3(0, 30, 40);
      }

      // Lerp Camera Position
      // Use a fast lerp for responsiveness, but the transition flag holds it for a bit
      camera.position.lerp(targetCamPos, delta * 3.0);

      // End transition after enough time or if close enough
      if (
        transitionTimeRef.current > 1.5 ||
        camera.position.distanceTo(targetCamPos) < 0.5
      ) {
        isTransitioningRef.current = false;
      }
    }

    // 4. Manual Zoom Logic
    const zoomDirection = useTimerStore.getState().zoomDirection;
    if (zoomDirection !== 0 && !isTransitioningRef.current && controls) {
      // Zoom Speed
      const zoomSpeed = 20 * delta;

      // Vector from Target (controls.target) to Camera
      // controls.target should be synced with lookAtPos by step #2
      const direction = new THREE.Vector3().subVectors(
        camera.position,
        controls.target
      );
      const dist = direction.length();
      direction.normalize();

      // Move camera
      // If direction is 1 (Zoom In), we move AGAINST the vector (sub)
      // If direction is -1 (Zoom Out), we move WITH the vector (add)
      // Note: "Zoom In" usually means getting closer -> decreasing distance

      let newDist = dist;
      if (zoomDirection === 1) {
        newDist = Math.max(2, dist - zoomSpeed); // Min distance check
      } else {
        newDist = Math.min(100, dist + zoomSpeed); // Max distance check
      }

      // Apply new position
      const moveVec = direction.multiplyScalar(newDist);
      camera.position.copy(controls.target).add(moveVec);
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
          makeDefault
          enablePan={true} // Allow panning in free view
          enableZoom={true}
          maxDistance={100} // Increase max distance for freedom
          minDistance={2} // Allow close inspection
          autoRotate={status === "idle" && !focusedPlanetId}
          autoRotateSpeed={0.5}
          // Always enabled now
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
