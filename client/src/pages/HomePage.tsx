import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types";
import { useAppSelector } from "@/app/hooks";

export function HomePage() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const rec = await api.get<{ propertyIds: string[] }>("/recommendations");
        setIds(rec.data.propertyIds);
        const list = rec.data.propertyIds.length
          ? await Promise.all(rec.data.propertyIds.slice(0, 6).map((id) => api.get(`/properties/${id}`)))
          : [];
        setProps(list.map((r) => r.data.property as Property));
      } catch {
        const fallback = await api.get("/properties?limit=6");
        setProps(fallback.data.properties);
        setIds(null);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [user?._id]);

  return (
    <div>
      <section className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-ember/90"
          >
            Stays, without the noise
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-4xl font-semibold leading-tight text-paper sm:text-5xl"
          >
            Book short stays. Host with clarity. Keep everything in one calm workspace.
          </motion.h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-200">
            A full MERN build with JWT auth, host tooling, blog, notifications, and AI-assisted ranking (when you add a
            Gemini key). Payments run in a safe <span className="text-ink-100">demo mode</span>—no real cards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="btn-primary">
              Open catalog
            </Link>
            <Link to="/register" className="btn-ghost">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page border-t border-white/5 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-paper">Picked for you</h2>
            <p className="text-sm text-ink-200">
              {ids?.length
                ? "Ranked with Gemini when configured; otherwise a balanced fallback set."
                : "Popular listings in the catalog this week."}
            </p>
          </div>
          <Link to="/explore" className="text-sm text-ember hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-ink-200">Loading spaces…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {props.map((p, i) => (
              <PropertyCard key={p._id} p={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
