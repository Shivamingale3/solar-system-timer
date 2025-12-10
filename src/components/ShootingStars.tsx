"use client";

import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";

function SingleShootingStar({ onComplete }: { onComplete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Random start and end positions in the "sky"
  // Far away (radius ~100)
  const [startPos, endPos, speed] = useMemo(() => {
    const r = 100;
    const theta1 = Math.random() * Math.PI * 2;
    const phi1 = Math.acos(2 * Math.random() - 1);
    const start = new THREE.Vector3().setFromSphericalCoords(r, phi1, theta1);

    // End position: somewhere generally "across" but not necessarily antipodal
    // Let's just pick another random point
    const theta2 = Math.random() * Math.PI * 2;
    const phi2 = Math.acos(2 * Math.random() - 1);
    const end = new THREE.Vector3().setFromSphericalCoords(r, phi2, theta2);

    const s = 40 + Math.random() * 40; // High speed
    return [start, end, s];
  }, []);

  const [t, setT] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const newT = t + delta * 0.5; // normalized time roughly
    setT(newT);

    // Linear interpolation
    // But we want it to move physically at 'speed'
    // dist = speed * dt
    // We can just move the mesh along the vector
    // dir = (end - start).normalize()

    if (newT > 1) {
      onComplete();
      return;
    }

    meshRef.current.position.lerpVectors(startPos, endPos, newT);
  });

  return (
    <Trail
      width={2}
      length={8}
      color={new THREE.Color(2, 2, 2)}
      decay={1}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={startPos}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </Trail>
  );
}

// Manager to spawn them
export default function ShootingStars() {
  const [starKey, setStarKey] = useState(0);
  // Simple logic: show one, when done, wait random time, show next using key
  const [active, setActive] = useState(false);

  useFrame((state) => {
    // Randomly spawn if not active
    if (!active && Math.random() < 0.005) {
      // ~1% chance per frame? 0.005 is roughly once every 3-4 seconds at 60fps
      setActive(true);
    }
  });

  if (!active) return null;

  return (
    <SingleShootingStar
      key={starKey}
      onComplete={() => {
        setActive(false);
        setStarKey((k) => k + 1);
      }}
    />
  );
}
