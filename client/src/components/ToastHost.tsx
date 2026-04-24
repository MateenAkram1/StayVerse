import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setToast } from "@/features/ui/uiSlice";

export function ToastHost() {
  const toast = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch(setToast(null)), 4200);
    return () => clearTimeout(t);
  }, [toast, dispatch]);
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`pointer-events-auto max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lift ${
              toast.type === "ok" ? "border-pine-400/40 bg-ink-800/95 text-ink-50" : "border-red-500/30 bg-ink-800/95 text-red-200"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const dispatch = useAppDispatch();
  return (message: string, type: "ok" | "err" = "ok") => dispatch(setToast({ message, type }));
}
