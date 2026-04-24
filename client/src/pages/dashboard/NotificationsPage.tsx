import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { api } from "@/api/client";
import type { Notification } from "@/types";

export function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);

  const load = async () => {
    const { data } = await api.get("/notifications");
    setList(data.notifications);
  };

  useEffect(() => {
    void load();
  }, []);

  const read = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    void load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-paper">Inbox</h1>
      <div className="mt-4 space-y-2">
        {list.map((n) => (
          <div
            key={n._id}
            className={`panel p-3 ${!n.read ? "border-ember/30" : ""}`}
          >
            <p className="text-sm text-ink-100/95">{n.message}</p>
            <p className="mt-1 text-xs text-ink-200/80">{format(new Date(n.createdAt), "MMM d, HH:mm")}</p>
            {n.link && (
              <Link to={n.link} className="text-xs text-ember hover:underline" onClick={() => read(n._id)}>
                Open
              </Link>
            )}
            {!n.read && (
              <button type="button" className="ml-2 text-xs text-ink-200 hover:underline" onClick={() => read(n._id)}>
                Mark read
              </button>
            )}
          </div>
        ))}
        {!list.length && <p className="text-ink-200">You’re all caught up.</p>}
      </div>
    </div>
  );
}
