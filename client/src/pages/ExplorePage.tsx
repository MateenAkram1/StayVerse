import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types";
import { POPULAR_CITIES, PROPERTY_TYPES } from "@/constants/travel";

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const q = params.get("q") || "";
  const city = params.get("city") || "";
  const min = params.get("min") || "";
  const max = params.get("max") || "";
  const type = params.get("type") || "";
  const checkIn = params.get("checkIn") || "";
  const checkOut = params.get("checkOut") || "";
  const guests = params.get("guests") || "";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const search = new URLSearchParams();
      if (q) search.set("q", q);
      if (city) search.set("city", city);
      if (min) search.set("minPrice", min);
      if (max) search.set("maxPrice", max);
      if (type) search.set("type", type);
      if (checkIn) search.set("checkIn", checkIn);
      if (checkOut) search.set("checkOut", checkOut);
      if (guests) search.set("minGuests", guests);
      const { data } = await api.get(`/properties?${search.toString()}`);
      setList(data.properties);
      setTotal(data.total);
      setLoading(false);
    };
    void run();
  }, [q, city, min, max, type, checkIn, checkOut, guests]);

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p);
  };

  return (
    <div className="container-page py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ring-gradient glass relative overflow-hidden rounded-3xl p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-ember/20 blur-3xl" />
        <h1 className="font-display text-3xl text-paper">Explore</h1>
        <p className="mt-1 text-ink-200">Search inspired by Airbnb/Booking patterns: destination, dates, guests, and type.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Flexible dates", "Entire homes", "Great views", "Top host picks"].map((chip) => (
            <span key={chip} className="rounded-full border border-white/15 bg-night/60 px-3 py-1 text-xs text-ink-100/90">
              {chip}
            </span>
          ))}
        </div>
      </motion.div>
      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-ink-800/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Keywords
          <input
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="e.g. balcony, work desk"
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          City
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={city}
            onChange={(e) => update("city", e.target.value)}
          >
            <option value="">Any city</option>
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Type
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">Any</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Guests
          <select
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={guests}
            onChange={(e) => update("guests", e.target.value)}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((g) => (
              <option key={g} value={String(g)}>
                {g}+
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Min $ / night
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={min}
            onChange={(e) => update("min", e.target.value)}
            min={0}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Max $ / night
          <input
            type="number"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={max}
            onChange={(e) => update("max", e.target.value)}
            min={0}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80">
          Check-in
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={checkIn}
            onChange={(e) => update("checkIn", e.target.value)}
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-ink-200/80 col-span-1 sm:col-span-2 lg:col-span-1">
          Check-out
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={checkOut}
            onChange={(e) => update("checkOut", e.target.value)}
          />
        </label>
      </div>
      <p className="mt-4 text-sm text-ink-200/90">
        {total} listing{total === 1 ? "" : "s"} found
        {loading ? " · searching…" : ""}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          list.map((p, i) => (
            <PropertyCard key={p._id} p={p} index={i} />
          ))}
      </div>
    </div>
  );
}
