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
    >
      <Link
        to={`/stay/${p._id}`}
        className="group block overflow-hidden rounded-xl border border-white/5 bg-ink-800/40 transition hover:border-pine-400/25"
      >
        <div className="relative aspect-[5/3] overflow-hidden">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-ink-900/80 px-3 py-2 text-xs uppercase tracking-wider text-ink-100/80">
            {p.city} · {p.type}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-display text-paper line-clamp-2 text-base leading-snug group-hover:text-white">{p.title}</h3>
          <p className="mt-2 text-sm text-ink-200">
            <span className="font-semibold text-ember">${p.pricePerNight}</span> / night · up to {p.maxGuests} guests
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
