import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/ToastHost";

type F = {
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  pricePerNight: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
};

const empty: F = {
  title: "",
  description: "",
  type: "entire",
  address: "",
  city: "",
  country: "",
  lat: "31.52",
  lng: "74.35",
  pricePerNight: "80",
  maxGuests: "2",
  bedrooms: "1",
  bathrooms: "1",
  amenities: "wifi, kitchen, parking",
};

export function ListingEditorPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<F>(empty);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isNew || !id) return;
      const { data } = await api.get(`/properties/${id}`);
      const p = data.property;
      setForm({
        title: p.title,
        description: p.description,
        type: p.type,
        address: p.address,
        city: p.city,
        country: p.country || "",
        lat: String(p.location.lat),
        lng: String(p.location.lng),
        pricePerNight: String(p.pricePerNight),
        maxGuests: String(p.maxGuests),
        bedrooms: String(p.bedrooms),
        bathrooms: String(p.bathrooms),
        amenities: (p.amenities || []).join(", "),
      });
    };
    void load();
  }, [id, isNew]);

  const ch = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      title: form.title,
      description: form.description,
      type: form.type,
      address: form.address,
      city: form.city,
      country: form.country,
      location: { lat: Number(form.lat), lng: Number(form.lng) },
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities,
    };
    try {
      if (isNew) {
        const { data } = await api.post("/properties", body);
        const pid = data.property._id;
        if (files?.length) {
          const fd = new FormData();
          Array.from(files).forEach((f) => fd.append("images", f));
          await api.post(`/properties/${pid}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
        toast("Listing created", "ok");
        nav(`/dashboard/listings/${pid}`);
      } else if (id) {
        await api.patch(`/properties/${id}`, body);
        if (files?.length) {
          const fd = new FormData();
          Array.from(files).forEach((f) => fd.append("images", f));
          await api.post(`/properties/${id}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        }
        toast("Saved", "ok");
      }
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Save failed", "err");
    }
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <h1 className="font-display text-2xl text-paper">{isNew ? "New listing" : "Edit listing"}</h1>
      <label className="block text-xs uppercase text-ink-200/80">
        Title
        <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.title} onChange={ch("title")} required />
      </label>
      <label className="block text-xs uppercase text-ink-200/80">
        Description
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          value={form.description}
          onChange={ch("description")}
          required
        />
      </label>
      <label className="block text-xs uppercase text-ink-200/80">
        Type
        <select
          className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          value={form.type}
          onChange={ch("type")}
        >
          {["entire", "room", "shared", "villa", "cabin", "condo"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase text-ink-200/80">
          Address
          <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.address} onChange={ch("address")} required />
        </label>
        <label className="block text-xs uppercase text-ink-200/80">
          City
          <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.city} onChange={ch("city")} required />
        </label>
      </div>
      <label className="block text-xs uppercase text-ink-200/80">
        Country
        <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.country} onChange={ch("country")} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase text-ink-200/80">
          Latitude
          <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.lat} onChange={ch("lat")} required />
        </label>
        <label className="block text-xs uppercase text-ink-200/80">
          Longitude
          <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.lng} onChange={ch("lng")} required />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs uppercase text-ink-200/80">
          Price / night
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={form.pricePerNight}
            onChange={ch("pricePerNight")}
            required
          />
        </label>
        <label className="block text-xs uppercase text-ink-200/80">
          Max guests
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={form.maxGuests}
            onChange={ch("maxGuests")}
            required
          />
        </label>
        <label className="block text-xs uppercase text-ink-200/80">
          Bedrooms
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={form.bedrooms}
            onChange={ch("bedrooms")}
            required
          />
        </label>
        <label className="block text-xs uppercase text-ink-200/80">
          Bathrooms
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={form.bathrooms}
            onChange={ch("bathrooms")}
            required
          />
        </label>
      </div>
      <label className="block text-xs uppercase text-ink-200/80">
        Amenities (comma-separated)
        <input className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.amenities} onChange={ch("amenities")} />
      </label>
      <div>
        <p className="text-xs uppercase text-ink-200/80">Images (optional)</p>
        <input type="file" accept="image/*" multiple className="mt-1 text-sm text-ink-200" onChange={(e) => setFiles(e.target.files)} />
      </div>
      <button className="btn-primary" type="submit">
        {isNew ? "Publish" : "Save changes"}
      </button>
    </form>
  );
}
