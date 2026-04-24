import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import type { Property } from "@/types";
import { useToast } from "@/components/ToastHost";

export function ListingsPage() {
  const [list, setList] = useState<Property[]>([]);
  const toast = useToast();

  const load = async () => {
    const { data } = await api.get("/properties/mine");
    setList(data.properties);
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/properties/${id}`);
      toast("Listing removed", "ok");
      void load();
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Failed", "err");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-paper">Your listings</h1>
        <Link to="/dashboard/listings/new" className="btn-primary text-sm">
          New listing
        </Link>
      </div>
      <div className="mt-6 space-y-2">
        {list.map((p) => (
          <div key={p._id} className="panel flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="font-medium text-paper">{p.title}</p>
              <p className="text-sm text-ink-200">
                {p.city} · ${p.pricePerNight}/night · {p.isActive ? "live" : "hidden"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/dashboard/listings/${p._id}`} className="btn-ghost !py-1.5 text-xs">
                Edit
              </Link>
              <Link to={`/stay/${p._id}`} className="btn-ghost !py-1.5 text-xs">
                View
              </Link>
              <button type="button" className="text-xs text-red-300/90 hover:underline" onClick={() => remove(p._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {!list.length && <p className="text-ink-200">Create your first listing to appear in search.</p>}
      </div>
    </div>
  );
}
