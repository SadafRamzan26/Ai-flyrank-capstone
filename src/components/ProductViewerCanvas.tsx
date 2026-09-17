"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import type { Mesh } from "three";
import { Color } from "three";

function StudioObject() {
  const meshRef = useRef<Mesh>(null);
  const { color, metalness, roughness, wireframe, autoRotateSpeed } = useControls("Object finish", {
    color: { value: "#50e3c2", label: "Material color" },
    metalness: { value: 0.72, min: 0, max: 1, step: 0.01, label: "Metalness" },
    roughness: { value: 0.22, min: 0, max: 1, step: 0.01, label: "Roughness" },
    wireframe: { value: false, label: "Wireframe" },
    autoRotateSpeed: { value: 0.35, min: 0, max: 2, step: 0.05, label: "Auto-rotate" },
  });

  useFrame((_, delta) => {
    if (meshRef.current && autoRotateSpeed > 0) {
      meshRef.current.rotation.y += delta * autoRotateSpeed;
      meshRef.current.rotation.x += delta * autoRotateSpeed * 0.18;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <torusKnotGeometry args={[1.15, 0.34, 96, 16]} />
      <meshStandardMaterial
        color={new Color(color)}
        metalness={metalness}
        roughness={roughness}
        wireframe={wireframe}
      />
    </mesh>
  );
}

export default function ProductViewerCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.25, 4.2], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      shadows
    >
      <color attach="background" args={["#111827"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <StudioObject />
      <ContactShadows position={[0, -1.55, 0]} opacity={0.42} scale={5} blur={2.4} far={4} />
      <Environment preset="studio" />
      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={6} enableDamping dampingFactor={0.08} />
    </Canvas>
  );
}
