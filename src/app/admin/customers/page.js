"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API = "/api/admin/customers";
const PAGE_SIZE = 8;

/* --------------------------------- Helpers -------------------------------- */
const fmtMoney = (n) => `PKR ${Number(n || 0).toLocaleString("en-US")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// If your API reads the JWT from an Authorization header instead of a cookie, add it here.
const authHeaders = () => ({ "Content-Type": "application/json" });

const ORDER_BADGE = {
  pending: "border-orange-200 bg-orange-50 text-orange-500",
  processing: "border-blue-200 bg-blue-50 text-blue-500",
  shipped: "border-green-200 bg-green-50 text-green-600",
  delivered: "border-green-200 bg-green-50 text-green-600",
  cancelled: "border-red-200 bg-red-50 text-red-500",
};

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${
        active
          ? "border-green-200 bg-green-50 text-green-600"
          : "border-gray-200 bg-gray-100 text-gray-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function Avatar({ name, size = "h-10 w-10", text = "text-xs" }) {
  return (
    <span
      className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-orange-50 font-semibold text-orange-600`}
    >
      {initials(name)}
    </span>
  );
}

/* ----------------------------- Customer modal ----------------------------- */

function CustomerModal({ id, summary, onClose, onStatusChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/${id}`, {
          cache: "no-store",
          credentials: "include",
          headers: authHeaders(),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load customer");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const active = data ? data.customer.isActive : summary.isActive;

  const toggle = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update customer");
      setData((d) => (d ? { ...d, customer: { ...d.customer, isActive: json.isActive } } : d));
      onStatusChanged(id, json.isActive);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <Avatar name={summary.name} size="h-12 w-12" text="text-sm" />
            <div>
              <h2 className="text-base font-bold text-gray-900">{summary.name}</h2>
              <p className="text-sm text-gray-500">{summary.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge active={active} />
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-md text-lg text-gray-400 hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Total orders</p>
              <p className="mt-1 font-bold text-gray-900">{summary.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Total spent</p>
              <p className="mt-1 font-bold text-gray-900">{fmtMoney(summary.totalSpent)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Joined</p>
              <p className="mt-1 font-bold text-gray-900">{fmtDate(summary.createdAt)}</p>
            </div>
          </div>

          {loading && <p className="text-sm text-gray-400">Loading details…</p>}

          {data && (
            <>
              <section>
                <h3 className="text-sm font-semibold text-gray-900">
                  Addresses ({data.customer.addresses.length})
                </h3>
                {data.customer.addresses.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">No saved addresses.</p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {data.customer.addresses.map((a) => (
                      <address
                        key={a._id}
                        className="rounded-xl border border-gray-200 p-3 text-sm not-italic leading-6 text-gray-600"
                      >
                        <span className="font-medium text-gray-900">{a.fullName || "—"}</span>
                        <br />
                        {a.phone && (
                          <>
                            {a.phone}
                            <br />
                          </>
                        )}
                        {a.addressLine}
                        <br />
                        {[a.city, a.province, a.postalCode].filter(Boolean).join(", ")}
                      </address>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-900">Recent orders</h3>
                {data.recentOrders.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">No orders yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {data.recentOrders.map((o) => {
                      const status = String(o.status || "pending").toLowerCase();
                      return (
                        <li key={o._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">
                              #{o.orderNumber || String(o._id).slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">{fmtDate(o.createdAt)}</p>
                          </div>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                              ORDER_BADGE[status] || "border-gray-200 bg-gray-50 text-gray-500"
                            }`}
                          >
                            {cap(status)}
                          </span>
                          <span className="font-medium text-gray-900">{fmtMoney(o.total)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={toggle}
            disabled={saving || loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              active ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {saving ? "Saving…" : active ? "Deactivate customer" : "Activate customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(API, { cache: "no-store", credentials: "include", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load customers");
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locations = useMemo(
    () => [...new Set(customers.flatMap((c) => c.cities))].sort((a, b) => a.localeCompare(b)),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      if (locationFilter !== "all" && !c.cities.includes(locationFilter)) return false;
      if (q && !`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [customers, search, statusFilter, locationFilter]);

  useEffect(() => setPage(1), [search, statusFilter, locationFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const first = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filtered.length);

  const openCustomer = customers.find((c) => c._id === openId);

  const onStatusChanged = (id, isActive) =>
    setCustomers((prev) => prev.map((c) => (c._id === id ? { ...c, isActive } : c)));

  const selectCls =
    "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="w-full p-6">
      <h1 className="text-xl font-bold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your customer accounts.</p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${selectCls} w-44`}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className={`${selectCls} w-48`}
        >
          <option value="all">All Locations</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    Loading customers…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No customers match your filters.
                  </td>
                </tr>
              )}

              {rows.map((c, i) => (
                <tr key={c._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <span className="font-semibold text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-gray-500" title={c.email}>
                    {c.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{c.totalOrders}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {fmtMoney(c.totalSpent)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={c.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setOpenId(c._id)}
                      className="rounded-lg border border-orange-300 px-4 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing {first} to {last} of {filtered.length} customers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-md text-xs font-medium ${
                  n === page
                    ? "bg-orange-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {openCustomer && (
        <CustomerModal
          id={openCustomer._id}
          summary={openCustomer}
          onClose={() => setOpenId(null)}
          onStatusChanged={onStatusChanged}
        />
      )}
    </div>
  );
}