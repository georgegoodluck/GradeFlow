"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function Orb() {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial color="#C6A664" metalness={1} roughness={0.25} />
    </mesh>
  );
}

export function GoldOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={1.5} />
      <Environment resolution={128} frames={1}>
        <Lightformer position={[0, 3, 2]} scale={[5, 5, 1]} intensity={3} />
        <Lightformer
          position={[-3, -1, -2]}
          scale={[4, 4, 1]}
          intensity={2}
          color="#C6A664"
        />
      </Environment>
      <Orb />
    </Canvas>
  );
}
