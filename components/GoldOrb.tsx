"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Float, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function Orb() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        color="#C6A664"
        metalness={1}
        roughness={0.15}
        envMapIntensity={2}
      />
    </mesh>
  );
}

export function GoldOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
      {/* Bright lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      {/* This Environment preset bounces light off the orb for that metallic gold look */}
      <Environment preset="studio" />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Orb />
      </Float>
    </Canvas>
  );
}
