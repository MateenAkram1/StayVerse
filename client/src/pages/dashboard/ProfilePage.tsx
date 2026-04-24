import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/api/client";
import { setUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/app/hooks";
import type { User } from "@/types";
import { useToast } from "@/components/ToastHost";

export function ProfilePage() {
  const u = useAppSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    city: "",
    maxPrice: "500",
    types: "entire, villa",
  });
  const [file, setFile] = useState<File | null>(null);
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    if (!u) return;
    setForm({
      name: u.name,
      phone: u.phone || "",
      bio: u.bio || "",
      city: u.locationCity || "",
      maxPrice: String(u.preferences?.maxPrice ?? 500),
      types: (u.preferences?.propertyTypes || ["entire"]).join(", "),
    });
  }, [u]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await api.patch("/users/profile", {
      name: form.name,
      phone: form.phone,
      bio: form.bio,
      locationCity: form.city,
      preferences: {
        maxPrice: Number(form.maxPrice),
        propertyTypes: form.types
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    });
    dispatch(setUser(data.user as User));
    if (file) {
      const fd = new FormData();
      fd.append("image", file);
      const r2 = await api.post("/users/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      dispatch(setUser(r2.data.user as User));
    }
    toast("Profile saved", "ok");
    setFile(null);
  };

  const role = async (r: "guest" | "host") => {
    const { data } = await api.patch("/users/role", { role: r });
    dispatch(setUser(data.user as User));
    toast(`Now using ${r} mode`, "ok");
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch("/auth/password", { currentPassword: curPass, newPassword: newPass });
      toast("Password updated", "ok");
      setCurPass("");
      setNewPass("");
    } catch (err) {
      const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(m || "Failed", "err");
    }
  };

  if (!u) {
    return null;
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-2xl text-paper">Profile</h1>
        {u.avatar && <img src={u.avatar} alt="" className="mt-3 h-20 w-20 rounded-full border border-white/10 object-cover" />}
      </div>
      <form onSubmit={save} className="space-y-3">
        {(["name", "phone", "bio", "city", "maxPrice", "types"] as const).map((k) => (
          <label key={k} className="block text-xs uppercase text-ink-200/80">
            {k === "maxPrice" ? "Rec. max price" : k === "types" ? "Property types (comma)" : k}
            <input
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm normal-case"
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
            />
          </label>
        ))}
        <div>
          <p className="text-xs uppercase text-ink-200/80">Avatar</p>
          <input type="file" accept="image/*" className="mt-1 text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button className="btn-primary" type="submit">
          Save
        </button>
      </form>
      <div className="panel p-4">
        <p className="text-sm text-ink-200">Work as guest (book trips) or host (list places).</p>
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => role("guest")}>
            Guest
          </button>
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => role("host")}>
            Host
          </button>
        </div>
      </div>
      <form onSubmit={changePw} className="panel space-y-2 p-4">
        <h2 className="text-paper">Change password</h2>
        <input
          className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          placeholder="Current"
          type="password"
          value={curPass}
          onChange={(e) => setCurPass(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-white/10 bg-ink-900/60 px-3 py-2 text-sm"
          placeholder="New (6+ chars)"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <button className="btn-ghost" type="submit">
          Update password
        </button>
      </form>
    </div>
  );
}
