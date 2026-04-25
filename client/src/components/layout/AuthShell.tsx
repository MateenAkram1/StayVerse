import { motion } from "framer-motion";

export function AuthShell({
  children,
  title,
  subtitle,
  image,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <div className="relative z-10 flex min-h-screen">
      <div className="relative hidden w-[42%] min-w-[300px] flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-ink-800/30 p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 top-0 h-[60%] w-[80%] rounded-full bg-ember/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-pine-600/25 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <p className="font-display text-2xl font-bold tracking-tight text-paper">StayVerse</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-200/90">
            Curated spaces, smooth booking, and a wallet you control — in this demo, every flow is designed to feel
            real.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {["Immersive motion & depth", "Simulated secure checkout", "AI-assisted discovery"].map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 text-sm text-ink-100/90"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_8px_rgba(184,74,46,0.6)]" />
              {line}
            </motion.div>
          ))}
        </div>
        <div className="relative z-0">
          <img
            src={image}
            alt={title}
            className="h-56 w-full rounded-2xl border border-white/10 object-cover shadow-card"
            loading="lazy"
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <motion.div
            key={`${title}-${subtitle}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h1 className="font-display text-3xl font-bold tracking-tight text-paper lg:text-4xl">{title}</h1>
            <p className="mt-1 text-sm text-ink-200/95">{subtitle}</p>
          </motion.div>
          {children}
        </div>
      </div>
    </div>
  );
}
