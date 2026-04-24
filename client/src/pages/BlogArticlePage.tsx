import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/api/client";
import type { BlogPost } from "@/types";

export function BlogArticlePage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/blog/${id}`);
        setPost(data.blog);
      } catch {
        setErr("Post not found or not published.");
      }
    };
    void run();
  }, [id]);

  if (err) {
    return (
      <div className="container-page py-20 text-ink-200">
        {err} <Link to="/blog" className="text-ember">Back</Link>
      </div>
    );
  }
  if (!post) {
    return <div className="container-page py-20 text-ink-200">Loading…</div>;
  }

  return (
    <article className="container-page max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-ember/90">{post.category}</p>
      <h1 className="mt-2 font-display text-4xl text-paper">{post.title}</h1>
      <p className="mt-2 text-sm text-ink-200">
        {post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {post.coverImage && <img src={post.coverImage} alt="" className="mt-8 w-full rounded-xl border border-white/5" />}
      <div className="prose-p:mt-4 prose-p:text-ink-100/90 prose-p:leading-relaxed mt-8 whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
