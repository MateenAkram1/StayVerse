import { useState } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/ToastHost";
import { LeafletMap } from "@/components/LeafletMap";
import { motion } from "framer-motion";

const HQ = { lat: 31.48, lng: 74.35, label: "NUCES Lahore (example pin)" };

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/contact", { name, email, message });
      toast(data.message, "ok");
      setName("");
      setMessage("");
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Could not send", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl text-paper">Contact & location</h1>
      <p className="mt-1 max-w-xl text-ink-200">Leave a message for the project team. Map uses free OSM tiles — replace coordinates with your campus or office for demos.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel space-y-4 p-5"
        >
          <label className="block text-xs uppercase tracking-wider text-ink-200/80">
            Name
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-ink-200/80">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-ink-200/80">
            Message
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2.5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send"}
          </button>
        </motion.form>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-200/80">Map (free tier)</p>
          <p className="text-sm text-ink-200/90">No Google Maps key required — see docs for the OSM + Leaflet choice.</p>
          <div className="mt-2">
            <LeafletMap lat={HQ.lat} lng={HQ.lng} label={HQ.label} />
          </div>
        </div>
      </div>
    </div>
  );
}
