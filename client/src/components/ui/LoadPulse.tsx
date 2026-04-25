import { motion } from "framer-motion";

export function LoadPulse({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-ink-200">
      <div className="relative h-12 w-12">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-ember/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-t-ember border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-sm tracking-wide animate-pulse">{label}</p>
    </div>
  );
}

export function TextShimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative block min-h-[0.5rem] overflow-hidden rounded-md bg-ink-800/60 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.02) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-sweep 1.4s ease-in-out infinite",
      }}
    />
  );
}
