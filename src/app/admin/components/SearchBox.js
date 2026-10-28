"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { api } from "./api";
import { useClickOutside } from "./useClickOutside";

// Accepts [{id,title,subtitle,type,href}] or { products: [...], orders: [...] }
function normalize(data) {
  if (Array.isArray(data)) return data;
  return Object.entries(data || {}).flatMap(([type, items]) =>
    Array.isArray(items) ? items.map((i) => ({ ...i, type: i.type || type })) : []
  );
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await api(`/search?q=${encodeURIComponent(q)}`);
     
        if (!cancelled) {
          setResults(normalize(data));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="Search anything..."
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      />
      {loading && (
        <Loader2
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
        />
      )}

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {error ? (
            <p className="px-3 py-3 text-sm text-red-500">{error}</p>
          ) : results.length === 0 && !loading ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              No results for “{query.trim()}”.
            </p>
          ) : (
            results.map((item, i) => (
              <Link
                key={`${item.type}-${item.id ?? i}`}
                href={item.href || "#"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {item.title || item.name}
                  </span>
                  {item.subtitle && (
                    <span className="block truncate text-xs text-slate-500">
                      {item.subtitle}
                    </span>
                  )}
                </span>
                {item.type && (
                  <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
                    {item.type}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
