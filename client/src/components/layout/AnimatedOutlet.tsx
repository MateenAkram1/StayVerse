import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease }}
        className="min-h-0 w-full"
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
