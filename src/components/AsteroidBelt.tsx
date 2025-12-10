"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface AsteroidBeltProps {
  count?: number;
}

export default function AsteroidBelt({ count = 2500 }: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random data for asteroids
  const asteroids = useMemo(() => {
    const temp = [];
    // Place between Mars (12) and Jupiter (15)
    // Let's say 13 to 14.5
    const minR = 12.8;
    const maxR = 14.2;

    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(minR, maxR);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      // Main belt is relatively flat but has some spread
      const y = THREE.MathUtils.randFloatSpread(0.8);

      const x = r * Math.sin(theta);
      const z = r * Math.cos(theta);

      const scale = THREE.MathUtils.randFloat(0.015, 0.05); // Small rocks

      temp.push({
        x,
        y,
        z,
        scale,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
      });
    }
    return temp;
  }, [count]);

  // Animate the entire belt
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02; // Slow orbital rotation
    }
  });

  // Set instance matrices
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    asteroids.forEach((data, i) => {
      dummy.position.set(data.x, data.y, data.z);
      dummy.rotation.set(
        data.rotation[0] as number,
        data.rotation[1] as number,
        data.rotation[2] as number
      );
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroids, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Low poly geometry for performance */}
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#888888"
        roughness={0.9}
        metalness={0.1}
        colorWrite={true}
      />
    </instancedMesh>
  );
}
