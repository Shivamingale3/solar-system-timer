"use client";

import * as THREE from "three";

interface OrbitPathProps {
  radius: number;
}

export default function OrbitPath({ radius }: OrbitPathProps) {
  // Using a simple LineLoop geometry for a super thin, crisp line
  // "Ring" from Drei is a mesh, which can look thick.
  // Native THREE.Line with BufferGeometry is best for "hairline" orbits.

  const points = [];
  const divisions = 64;
  for (let i = 0; i <= divisions; i++) {
    const angle = (i / divisions) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius)
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // Create the line object once
  const line = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    })
  );

  return <primitive object={line} />;
}
