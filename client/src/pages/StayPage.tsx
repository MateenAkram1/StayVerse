import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { api } from "@/api/client";
import { LeafletMap } from "@/components/LeafletMap";
import type { Property, User } from "@/types";
import { useAppSelector } from "@/app/hooks";
import { useToast } from "@/components/ToastHost";
import { motion } from "framer-motion";

export function StayPage() {
  const { id } = useParams();
  const user = useAppSelector((s) => s.auth.user);
  const toast = useToast();
  const [property, setProperty] = useState<Property & { host?: User } | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState<{ _id: string; totalPrice: number; paymentStatus: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await api.get(`/properties/${id}`);
      setProperty(data.property);
      setGuests(1);
      setLoading(false);
    };
    void run();
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title, url: shareUrl });
      } catch {
        void navigator.clipboard.writeText(shareUrl);
        toast("Link copied to clipboard", "ok");
      }
    } else {
      void navigator.clipboard.writeText(shareUrl);
      toast("Link copied to clipboard", "ok");
    }
  };

  const book = async () => {
    if (!user) {
      toast("Sign in to request a stay", "err");
      return;
    }
    if (!property || !checkIn || !checkOut) {
      toast("Pick check-in and check-out dates", "err");
      return;
    }
    try {
      const { data } = await api.post("/bookings", {
        property: property._id,
        checkIn,
        checkOut,
        guests,
      });
      setBooking(data.booking);
      toast("Booking request sent. Complete demo payment to unlock host confirmation.", "ok");
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Could not create booking", "err");
    }
  };

  const pay = async () => {
    if (!booking) return;
    try {
      const { data } = await api.post("/payments/demo", { bookingId: booking._id });
      setBooking(data.booking);
      toast(data.message, "ok");
    } catch (e) {
      const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Payment failed (demo)", "err");
    }
  };

  if (loading || !property) {
    return (
      <div className="container-page py-24 text-ink-200">
        {loading ? "Loading listing…" : "Not found."}
      </div>
    );
  }

  const host = property.host as User | undefined;
  const firstImg = property.images?.[0] || "https://picsum.photos/900/500";

  return (
    <div className="container-page py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-200">
        <Link to="/explore" className="hover:text-paper">
          ← Back to explore
        </Link>
        <div className="flex gap-2">
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(property.title)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !py-1.5 text-xs"
          >
            Share on X
          </a>
          <button type="button" onClick={share} className="btn-ghost !py-1.5 text-xs">
            Copy / native share
          </button>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.img
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            src={firstImg}
            alt=""
            className="h-64 w-full rounded-xl border border-white/5 object-cover sm:h-80"
          />
          {property.images && property.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {property.images.slice(0, 6).map((u) => (
                <img key={u} src={u} alt="" className="h-16 w-24 shrink-0 rounded-md object-cover opacity-80" />
              ))}
            </div>
          )}
          <h1 className="mt-6 font-display text-3xl text-paper">{property.title}</h1>
          <p className="mt-2 text-ink-200">
            {property.address}, {property.city}
            {property.country ? `, ${property.country}` : ""}
          </p>
          <div className="mt-6 max-w-2xl whitespace-pre-wrap text-ink-100/95 leading-relaxed">{property.description}</div>
          {host && (
            <div className="mt-8 rounded-xl border border-white/5 bg-ink-800/50 p-4">
              <p className="text-xs uppercase tracking-wider text-ink-200/80">Host</p>
              <p className="mt-1 font-medium text-paper">{host.name}</p>
              {host.bio && <p className="mt-2 text-sm text-ink-200">{host.bio}</p>}
            </div>
          )}
        </div>
        <aside>
          <div className="panel sticky top-24 p-5">
            <p className="text-2xl font-semibold text-ember">
              ${property.pricePerNight} <span className="text-base font-normal text-ink-200">/ night</span>
            </p>
            <p className="mt-1 text-sm text-ink-200">
              {property.bedrooms} br · {property.bathrooms} bath · {property.maxGuests} guests
            </p>
            {property.amenities?.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <li key={a} className="rounded-full bg-ink-900/60 px-2.5 py-0.5 text-xs text-ink-100/90">
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <label className="text-xs text-ink-200/80">Check-in</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-ink-200/80">Check-out</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-ink-200/80">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={property.maxGuests}
                  className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>
            {!booking && (
              <button type="button" className="btn-primary mt-6 w-full" onClick={book}>
                Request to book
              </button>
            )}
            {booking && (
              <div className="mt-6 text-sm text-ink-200">
                <p>
                  <span className="text-ink-100">Request</span> · {format(new Date(checkIn), "MMM d")} –{" "}
                  {format(new Date(checkOut), "MMM d")} · ${booking.totalPrice} total
                </p>
                <p className="mt-1">Payment: {booking.paymentStatus} · {booking.status}</p>
                {booking.paymentStatus !== "mock_paid" && (
                  <button type="button" className="btn-primary mt-3 w-full" onClick={pay}>
                    Pay with demo checkout (no real charge)
                  </button>
                )}
                {booking.paymentStatus === "mock_paid" && (
                  <p className="mt-2 text-ember/90">Host can now confirm the booking from their dashboard.</p>
                )}
                <Link to="/dashboard/trips" className="mt-3 block text-center text-sm text-ember hover:underline">
                  View in trips
                </Link>
              </div>
            )}
          </div>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-200/80">Location</p>
            <p className="text-sm text-ink-200/90">OpenStreetMap tiles — free to use, no map API key needed.</p>
            <div className="mt-2">
              <LeafletMap lat={property.location.lat} lng={property.location.lng} label={property.title} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
