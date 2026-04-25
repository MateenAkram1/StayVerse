import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FloatingScene3D } from "./FloatingScene3D";

export function Scene3DLayer() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-[8] h-[100dvh] w-full overflow-hidden"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <FloatingScene3D />
        </Suspense>
      </Canvas>
    </div>
  );
}
