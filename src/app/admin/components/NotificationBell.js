"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "./api";
import { useFetch } from "./useFetch";
import { useClickOutside } from "./useClickOutside";
// import { api } from "@/lib/api";
// import { useFetch } from "@/hooks/useFetch";
// import { useClickOutside } from "@/hooks/useClickOutside";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { data, loading, error, reload } = useFetch("/notifications");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    if (Array.isArray(data)) setItems(data);
  }, [data]);

  // Refresh quietly every minute
  useEffect(() => {
    const id = setInterval(() => reload(true), 60000);
    return () => clearInterval(id);
  }, [reload]);

  const unread = items.filter((n) => !n.read).length;

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api("/notifications/read-all", { method: "PATCH" });
    } catch {
      reload(true);
    }
  }

  async function markRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      reload(true);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">
              Notifications{unread > 0 && ` (${unread})`}
            </p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-orange-500 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Loading...</p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-red-500">{error}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                You’re all caught up.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                    n.read ? "" : "bg-orange-50/50"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? "bg-transparent" : "bg-orange-500"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">
                      {n.title}
                    </span>
                    {n.message && (
                      <span className="block text-xs text-slate-500">{n.message}</span>
                    )}
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
