import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

function RotatingIcosa() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.08;
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.45}>
      <mesh ref={ref} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.05, 1]} />
        <MeshDistortMaterial
          color="#2a4540"
          emissive="#120806"
          emissiveIntensity={0.12}
          roughness={0.28}
          metalness={0.72}
          distort={0.32}
          speed={1.15}
        />
      </mesh>
    </Float>
  );
}

function EmberTorus() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.15;
      ref.current.rotation.z = state.clock.elapsedTime * 0.08;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.25}>
      <mesh ref={ref} position={[-2.1, 0.4, -0.8]}>
        <torusGeometry args={[0.42, 0.15, 16, 48]} />
        <meshStandardMaterial
          color="#9e3d28"
          metalness={0.55}
          roughness={0.25}
          emissive="#2c1008"
          emissiveIntensity={0.18}
        />
      </mesh>
    </Float>
  );
}

function BackPlate() {
  return (
    <mesh position={[0.8, -1, -2.2]} rotation={[0.35, -0.4, 0.1]}>
      <boxGeometry args={[2.2, 0.08, 1.4]} />
      <meshStandardMaterial color="#1a1f2a" metalness={0.2} roughness={0.85} />
    </mesh>
  );
}

export function FloatingScene3D() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 4]} intensity={0.6} color="#ffe8d8" />
      <pointLight position={[-3, 2, 3]} intensity={0.5} color="#5a7d72" />
      <pointLight position={[3, -1, 2]} intensity={0.35} color="#c45c3c" />
      <RotatingIcosa />
      <EmberTorus />
      <BackPlate />
    </>
  );
}
