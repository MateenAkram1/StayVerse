import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { BlogPost } from "@/types";
import { motion } from "framer-motion";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const run = async () => {
        const { data } = await api.get("/blog", { params: { q: q || undefined, limit: 20 } });
        setPosts(data.blogs);
      };
      void run();
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl text-paper">Journal</h1>
      <p className="mt-1 text-ink-200">Travel field notes, product updates, and host tips.</p>
      <input
        className="mt-6 w-full max-w-md rounded-md border border-white/10 bg-ink-900/50 px-3 py-2 text-sm"
        placeholder="Search posts…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="mt-8 space-y-4">
        {posts.map((b, i) => (
          <motion.article
            key={b._id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="panel p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ember/90">{b.category}</p>
            <h2 className="mt-1 font-display text-xl text-paper">
              <Link to={`/blog/p/${b._id}`} className="hover:underline">
                {b.title}
              </Link>
            </h2>
            {b.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink-200">{b.excerpt}</p>}
            <p className="mt-2 text-xs text-ink-200/70">{new Date(b.createdAt).toLocaleDateString()}</p>
          </motion.article>
        ))}
        {!posts.length && <p className="text-ink-200">No posts yet. Seed the database or add one from the dashboard.</p>}
      </div>
    </div>
  );
}
