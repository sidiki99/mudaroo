"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useFetch } from "./useFetch";
import { useClickOutside } from "./useClickOutside";

export default function ProfileMenu() {
  const { data: user, loading } = useFetch("/me");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useClickOutside(ref, () => setOpen(false));

  const name = user?.name || "Admin";
  const role = user?.role || "Super Admin";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100"
      >
        {user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            {initials}
          </span>
        )}

        <span className="hidden text-left leading-tight sm:block">
          {loading ? (
            <span className="block h-7 w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            <>
              <span className="block text-sm font-semibold text-slate-800">{name}</span>
              <span className="block text-xs text-slate-500">{role}</span>
            </>
          )}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
