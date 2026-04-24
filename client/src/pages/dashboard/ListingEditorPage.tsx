import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/api/client";
import { useToast } from "@/components/ToastHost";
import { LocationPickerMap } from "@/components/LocationPickerMap";
import { POPULAR_CITIES, PROPERTY_TYPES } from "@/constants/travel";

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

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Lahore: { lat: 31.52, lng: 74.35 },
  Islamabad: { lat: 33.68, lng: 73.04 },
  Karachi: { lat: 24.86, lng: 67.01 },
  Dubai: { lat: 25.2, lng: 55.27 },
  Istanbul: { lat: 41.01, lng: 28.98 },
  Baku: { lat: 40.4, lng: 49.87 },
  Doha: { lat: 25.29, lng: 51.53 },
  "Kuala Lumpur": { lat: 3.14, lng: 101.69 },
  London: { lat: 51.5, lng: -0.12 },
  Paris: { lat: 48.85, lng: 2.35 },
  "New York": { lat: 40.71, lng: -74.0 },
  Tokyo: { lat: 35.67, lng: 139.65 },
};

export function ListingEditorPage() {
  const { id } = useParams();
  // Route "/dashboard/listings/new" has no :id param in this app,
  // so treat missing id as create mode.
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<F>(empty);
  const [files, setFiles] = useState<FileList | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [cityManuallyEdited, setCityManuallyEdited] = useState(false);
  const lat = Number(form.lat);
  const lng = Number(form.lng);

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

  const reverseGeocode = async (nextLat: number, nextLng: number) => {
    setGeoLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          String(nextLat)
        )}&lon=${encodeURIComponent(String(nextLng))}&zoom=18&addressdetails=1`
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        display_name?: string;
        address?: {
          city?: string;
          town?: string;
          village?: string;
          municipality?: string;
          county?: string;
          state_district?: string;
          hamlet?: string;
          suburb?: string;
          road?: string;
          house_number?: string;
          country?: string;
        };
      };
      const cityCandidates = [
        data.address?.city,
        data.address?.town,
        data.address?.municipality,
        data.address?.village,
        data.address?.county,
        data.address?.state_district,
        data.address?.hamlet,
      ]
        .filter(Boolean)
        .map((x) => String(x).trim());

      const rawCityGuess = cityCandidates[0] || "";
      const normalizedKnownCity =
        POPULAR_CITIES.find((known) => {
          const k = known.toLowerCase();
          const g = rawCityGuess.toLowerCase();
          return g === k || g.includes(k) || k.includes(g);
        }) || "";
      const cityGuess = normalizedKnownCity || rawCityGuess;
      const roadPart = [data.address?.house_number, data.address?.road].filter(Boolean).join(" ").trim();
      const addressGuess = roadPart || data.address?.suburb || data.display_name || "";
      setForm((f) => ({
        ...f,
        lat: String(nextLat),
        lng: String(nextLng),
        city: !cityManuallyEdited ? cityGuess || f.city : f.city,
        address: addressGuess || f.address,
        country: data.address?.country || f.country,
      }));
    } finally {
      setGeoLoading(false);
    }
  };

  const pickLocation = ({ lat: nextLat, lng: nextLng }: { lat: number; lng: number }) => {
    setForm((f) => ({ ...f, lat: String(nextLat), lng: String(nextLng) }));
    void reverseGeocode(nextLat, nextLng);
  };

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
          {PROPERTY_TYPES.map((t) => (
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
          <input
            list="city-options"
            className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
            value={form.city}
            onChange={(e) => {
              const cityValue = e.target.value;
              setCityManuallyEdited(true);
              setForm((f) => ({ ...f, city: cityValue }));
              if (CITY_COORDS[cityValue]) {
                setForm((f) => ({
                  ...f,
                  city: cityValue,
                  lat: String(CITY_COORDS[cityValue].lat),
                  lng: String(CITY_COORDS[cityValue].lng),
                }));
              }
            }}
            placeholder="Start typing a city"
            required
          />
          <datalist id="city-options">
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
      </div>
      <label className="block text-xs uppercase text-ink-200/80">
        Country
        <select className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm" value={form.country} onChange={ch("country")}>
          <option value="">Select country</option>
          {["Pakistan", "UAE", "Turkey", "Qatar", "Malaysia", "UK", "France", "USA", "Japan"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-ink-200/80">Property location</p>
        <p className="text-xs text-ink-200/80">
          Click on the map to drop a pin, or drag the marker to fine-tune location. Address and city auto-fill from pin and remain editable.
        </p>
        <LocationPickerMap
          lat={Number.isFinite(lat) ? lat : 31.52}
          lng={Number.isFinite(lng) ? lng : 74.35}
          onChange={pickLocation}
        />
        <div className="flex flex-wrap gap-2 text-xs text-ink-200/90">
          <span className="rounded-md bg-ink-900/70 px-2 py-1">Lat: {Number.isFinite(lat) ? lat.toFixed(6) : "-"}</span>
          <span className="rounded-md bg-ink-900/70 px-2 py-1">Lng: {Number.isFinite(lng) ? lng.toFixed(6) : "-"}</span>
          {geoLoading && <span className="rounded-md bg-ink-900/70 px-2 py-1">Detecting address...</span>}
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={() => {
              setCityManuallyEdited(false);
              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                void reverseGeocode(lat, lng);
              }
            }}
          >
            Auto-fill from pin
          </button>
          <button
            type="button"
            className="btn-ghost !py-1 text-xs"
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition((pos) => {
                setCityManuallyEdited(false);
                pickLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              });
            }}
          >
            Use current location
          </button>
        </div>
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
