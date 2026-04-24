import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Property } from "@/types";

type Props = { p: Property; index?: number };

export function PropertyCard({ p, index = 0 }: Props) {
  const img = p.images?.[0] || "https://picsum.photos/seed/placeholder/800/500";
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="tilt-wrap"
    >
      <Link
        to={`/stay/${p._id}`}
        className="tilt-item ring-gradient group block overflow-hidden rounded-2xl bg-ink-800/55 transition hover:-translate-y-1 hover:border-pine-400/25"
      >
        <div className="relative aspect-[5/3] overflow-hidden">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs uppercase tracking-wider text-ink-100/85">
            {p.city} · {p.type}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-paper line-clamp-2 text-base leading-snug group-hover:text-white">{p.title}</h3>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-ink-200">
              <span className="font-semibold text-ember">${p.pricePerNight}</span> / night
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-ink-100/90">{p.maxGuests} guests</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
