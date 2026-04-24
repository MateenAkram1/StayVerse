import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { BlogPost } from "@/types";
import { useToast } from "@/components/ToastHost";

export function MyBlogPage() {
  const [list, setList] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cat, setCat] = useState("Travel");
  const toast = useToast();

  const load = async () => {
    const { data } = await api.get("/blog/mine");
    setList(data.blogs);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/blog", { title, content, category: cat, published: true });
      setTitle("");
      setContent("");
      toast("Post published", "ok");
      void load();
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Failed", "err");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Writing</h1>
      <p className="text-sm text-ink-200">Create posts for the public journal. Host or admin only.</p>
      <form onSubmit={create} className="mt-6 max-w-2xl space-y-3 panel p-4">
        <input
          className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          placeholder="Category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        />
        <textarea
          className="min-h-[140px] w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          placeholder="Write in plain text or light Markdown"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">
          Publish
        </button>
      </form>
      <div className="mt-8 space-y-2">
        {list.map((b) => (
          <div key={b._id} className="panel flex items-center justify-between p-3">
            <p className="text-paper">{b.title}</p>
            <Link to={`/blog/p/${b._id}`} className="text-xs text-ember hover:underline">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
