import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types";
import { useAppSelector } from "@/app/hooks";
import { POPULAR_CITIES } from "@/constants/travel";

export function HomePage() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("2");
  const nav = useNavigate();
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
      <section className="container-page relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-ember/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-pine-400/20 blur-3xl" />
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex rounded-full border border-ember/35 bg-ember/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ember/90"
          >
            Stayverse Premium Homes
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-4xl font-semibold leading-tight text-paper sm:text-6xl"
          >
            Not just a place to stay.
            <span className="mt-2 block bg-gradient-to-r from-paper via-rose-100 to-orange-200 bg-clip-text text-transparent">
              A place that feels cinematic.
            </span>
          </motion.h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-100/95">
            Discover handpicked stays, immersive visuals, refined motion, and a polished booking flow inspired by modern travel platforms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="btn-primary">
              Start exploring
            </Link>
            <Link to="/register" className="btn-ghost">
              Become a host
            </Link>
          </div>
          <div className="mt-6 grid max-w-xl gap-2 rounded-2xl border border-white/10 bg-night/65 p-3 sm:grid-cols-[1fr_120px_120px]">
            <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm">
              <option value="">Pick a destination</option>
              {POPULAR_CITIES.slice(0, 8).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={guests} onChange={(e) => setGuests(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={String(g)}>
                  {g} guests
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary !rounded-xl !py-2.5"
              onClick={() => nav(`/explore?city=${encodeURIComponent(city)}&guests=${guests}`)}
            >
              Search
            </button>
          </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18, rotateX: 16 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7 }}
            className="tilt-wrap"
          >
            <div className="tilt-item ring-gradient glass relative overflow-hidden rounded-3xl p-3 shadow-lift">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
                alt="Featured stay"
                className="h-[360px] w-full rounded-2xl object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/20 bg-night/55 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.18em] text-ink-200/90">Featured Tonight</p>
                <p className="mt-1 font-display text-xl text-paper">Loft with skyline terrace</p>
                <p className="mt-1 text-sm text-ink-100/90">$148 / night · 4 guests</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page border-t border-white/5 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="space-y-1">
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
      <section className="container-page py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
          ].map((src, idx) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6, rotateX: 4, rotateY: idx === 1 ? -4 : 4 }}
              className="tilt-wrap"
            >
              <div className="tilt-item overflow-hidden rounded-2xl border border-white/10">
                <img src={src} alt="" className="h-56 w-full object-cover" loading="lazy" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
