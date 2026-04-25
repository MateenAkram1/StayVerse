/**
 * Global ambient layer: mesh gradients, soft orbs, noise — no WebGL.
 */
export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(47,77,70,0.45),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(184,74,46,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(30,58,95,0.18),transparent_50%)]" />
      <div
        className="absolute -left-[20%] top-[10%] h-[min(60vw,420px)] w-[min(60vw,420px)] animate-aurora-drift rounded-full bg-ember/25 blur-[100px] will-change-transform"
        style={{ animationDuration: "22s" }}
      />
      <div
        className="absolute -right-[10%] top-[30%] h-[min(50vw,380px)] w-[min(50vw,380px)] animate-aurora-drift rounded-full bg-pine-400/20 blur-[90px] will-change-transform [animation-direction:reverse]"
        style={{ animationDuration: "18s" }}
      />
      <div
        className="absolute bottom-[-5%] left-[25%] h-[min(45vw,320px)] w-[min(45vw,320px)] animate-aurora-drift rounded-full bg-indigo-900/30 blur-[85px] will-change-transform"
        style={{ animationDuration: "26s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
