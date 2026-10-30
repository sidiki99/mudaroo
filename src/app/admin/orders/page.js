"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API = "/api/admin/orders";
const PAGE_SIZE = 10;
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const getStatus = (o) => String(o.status || "pending").toLowerCase();
const getFulfillment = (o) => String(o.fulfillmentStatus || getStatus(o)).toLowerCase();
const getPayment = (o) => o.paymentMethod || o.payment?.method || "COD";
const getNumber = (o) => o.orderNumber || String(o._id).slice(-6).toUpperCase();
const getCustomer = (o) => {
  const u = o.user && typeof o.user === "object" ? o.user : {};
  return {
    name: u.name || u.fullName || u.username || o.shippingAddress?.fullName || "Customer",
    email: u.email || "",
    phone: u.phone || o.shippingAddress?.phone || "",
    avatar: u.avatar || u.image || "",
  };
};
const getItemImage = (item) => {
  const p = item.product && typeof item.product === "object" ? item.product : {};
  const first = Array.isArray(p.images) ? p.images[0] : null;
  return item.image || p.thumbnail || p.image || (typeof first === "string" ? first : first?.url) || "";
};

/* --------------------------------- Helpers -------------------------------- */
const fmtMoney = (n) => Number(n || 0).toLocaleString("en-US");
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// If your API reads the JWT from an Authorization header instead of a cookie, add it here.
const authHeaders = () => ({ "Content-Type": "application/json" });

const BADGE = {
  pending: "border-orange-200 bg-orange-50 text-orange-500",
  processing: "border-blue-200 bg-blue-50 text-blue-500",
  shipped: "border-green-200 bg-green-50 text-green-600",
  delivered: "border-green-200 bg-green-50 text-green-600",
  cancelled: "border-red-200 bg-red-50 text-red-500",
};

function Badge({ value, large = false }) {
  return (
    <span
      className={`inline-block rounded-md border font-medium ${
        large ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      } ${BADGE[value] || "border-gray-200 bg-gray-50 text-gray-500"}`}
    >
      {cap(value)}
    </span>
  );
}

function Avatar({ customer, size = "h-8 w-8" }) {
  return customer.avatar ? (
    <img src={customer.avatar} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-500`}
    >
      {initials(customer.name)}
    </span>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState(null);
  
  const [showFull, setShowFull] = useState(false);
  const [draft, setDraft] = useState({ status: "pending", fulfillment: "pending" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "ok" | "err", text }
  const detailRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(API, { cache: "no-store", credentials: "include", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------------------ Filtering ------------------------------ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59.999`) : null;

    return orders.filter((o) => {
      if (statusFilter !== "all" && getStatus(o) !== statusFilter) return false;

      const created = new Date(o.createdAt);
      if (start && created < start) return false;
      if (end && created > end) return false;

      if (q) {
        const c = getCustomer(o);
        const hay = `${getNumber(o)} ${c.name} ${c.email} ${c.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, from, to]);

  useEffect(() => setPage(1), [search, statusFilter, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const first = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filtered.length);

  /* ------------------------------ Selection ------------------------------ */
  useEffect(() => {
    if (!selectedId && orders.length) setSelectedId(orders[0]._id);
  }, [orders, selectedId]);

  const selected = useMemo(
    () => orders.find((o) => o._id === selectedId) || null,
    [orders, selectedId]
  );

  // Reset the status dropdowns whenever the selected order (or its saved status) changes
  useEffect(() => {
    if (selected) {
      setDraft({ status: getStatus(selected), fulfillment: getFulfillment(selected) });
      setNotice(null);
    }
  }, [selected?._id, selected?.status, selected?.fulfillmentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const openOrder = (id) => {
    setSelectedId(id);
    setShowFull(false);
    requestAnimationFrame(() =>
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  /* ------------------------------- Saving -------------------------------- */
  const dirty =
    selected && (draft.status !== getStatus(selected) || draft.fulfillment !== getFulfillment(selected));

  // const saveStatus = async () => {
  //   if (!selected || !dirty) return;
  //   setSaving(true);
  //   setNotice(null);
  //   try {
  //     const res = await fetch(`${API}/${selected._id}`, {
  //       method: "PATCH",
  //       credentials: "include",
  //       headers: authHeaders(),
  //       body: JSON.stringify({
  //         status: draft.status,
  //         fulfillmentStatus: draft.fulfillment,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || "Failed to update order");

  //     // Merge only the changed fields so the populated user/product data is kept
  //     setOrders((prev) =>
  //       prev.map((o) =>
  //         o._id === selected._id
  //           ? {
  //               ...o,
  //               status: data.order.status ?? draft.status,
  //               fulfillmentStatus: data.order.fulfillmentStatus ?? draft.fulfillment,
  //               updatedAt: data.order.updatedAt,
  //             }
  //           : o
  //       )
  //     );
  //     setNotice({ type: "ok", text: "Status saved." });
  //   } catch (err) {
  //     setNotice({ type: "err", text: err.message });
  //   } finally {
  //     setSaving(false);
  //   }
  // };


  
const saveStatus = async () => {
  if (!selected || !dirty) return;

  setSaving(true);
  setNotice(null);

  try {
    const res = await fetch(`${API}/${selected._id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: draft.status,
        fulfillmentStatus: draft.fulfillment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update order");
    }

    if (!res.ok) {
  throw new Error(data.message || "Failed to update order");
}

const updatedOrder = data.order;

// Update the orders list.
setOrders((prev) =>
  prev.map((order) =>
    String(order._id) === String(selected._id)
      ? { ...order, ...updatedOrder }
      : order
  )
);

// Update the dropdown values from the saved database response.
setDraft({
  status: updatedOrder.status,
  fulfillment: updatedOrder.fulfillmentStatus,
});

setNotice({
  type: "ok",
  text: "Status saved successfully.",
});
  } catch (err) {
    setNotice({
      type: "err",
      text: err.message || "Failed to update status",
    });
  } finally {
    setSaving(false);
  }
};

  const selectCls =
    "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  /* -------------------------------- Render ------------------------------- */
  return (
    <div className="w-full p-6">
      <h1 className="text-xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Track and manage customer orders.</p>

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
            placeholder="Search order number or customer…"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${selectCls} w-44`}
        >
          <option value="all">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {cap(s)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
            className="bg-transparent py-2 outline-none"
          />
          <span>→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
            className="bg-transparent py-2 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total (PKR)</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    Loading orders…
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
                    No orders match your filters.
                  </td>
                </tr>
              )}

              {rows.map((o) => {
                const c = getCustomer(o);
                const itemCount = (o.items || []).reduce((n, i) => n + (i.quantity || 0), 0);
                return (
                  <tr
                    key={o._id}
                    onClick={() => openOrder(o._id)}
                    className={`cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                      o._id === selectedId ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">#{getNumber(o)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar customer={c} />
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-700">{itemCount}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{fmtMoney(o.total)}</td>
                    <td className="px-4 py-3 text-gray-600">{getPayment(o)}</td>
                    <td className="px-4 py-3">
                      <Badge value={getStatus(o)} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={getFulfillment(o)} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrder(o._id);
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing {first} to {last} of {filtered.length} orders
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
            <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-orange-500 px-2 text-xs font-medium text-white">
              {page}
            </span>
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

      {/* Order detail */}
      {selected && (
        <div ref={detailRef} className="mt-5 scroll-mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-bold text-gray-900">Order #{getNumber(selected)}</h2>
              <Badge value={getStatus(selected)} large />
              <span className="text-xs text-gray-500">{fmtDateTime(selected.createdAt)}</span>
            </div>
            <button
              onClick={() => setShowFull((v) => !v)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {showFull ? "Hide Full Order" : "View Full Order"}
            </button>
          </div>

          {/* Status controls (saved permanently to the database) */}
          <div className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-gray-50/60 px-5 py-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Order status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                className={`${selectCls} w-44`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {cap(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Fulfillment</label>
              {/* <select
                value={draft.fulfillment}
                onChange={(e) => setDraft((d) => ({ ...d, fulfillment: e.target.value }))}
                className={`${selectCls} w-44`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {cap(s)}
                  </option>
                ))}
              </select> */}

              <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {cap(status)}
                    </option>
                  ))}
                </select>
            </div>
            <button
              onClick={saveStatus}
              disabled={!dirty || saving}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {notice && (
              <span className={`text-sm ${notice.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                {notice.text}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-[260px_1fr_300px] lg:divide-x lg:divide-y-0">
            {/* Customer */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900">Customer</h3>
              {(() => {
                const c = getCustomer(selected);
                return (
                  <div className="mt-4 flex items-start gap-3">
                    <Avatar customer={c} size="h-11 w-11" />
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      {c.email && <p className="truncate text-xs text-gray-500">{c.email}</p>}
                      {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Items */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Items ({(selected.items || []).length})
              </h3>
              <div className="mt-4 space-y-3">
                {(selected.items || []).map((item, idx) => {
                  const img = getItemImage(item);
                  return (
                    <div
                      key={item._id || idx}
                      className="flex gap-4 rounded-xl border border-gray-200 p-3"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {img ? (
                          <img src={img} alt={item.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                        {(item.color || item.size) && (
                          <p className="text-xs text-gray-500">
                            {[item.color && `Color: ${item.color}`, item.size && `Size: ${item.size}`]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                        <div className="mt-2 flex justify-between text-xs text-gray-600">
                          <span>PKR {fmtMoney(item.unitPrice)}</span>
                          <span>Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">
                            PKR {fmtMoney(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>
              <dl className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-900">PKR {fmtMoney(selected.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-gray-900">PKR {fmtMoney(selected.shippingFee)}</dd>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between">
                    <dt>Discount</dt>
                    <dd className="text-gray-900">- PKR {fmtMoney(selected.discount)}</dd>
                  </div>
                )}
                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                  <dt>Total</dt>
                  <dd>PKR {fmtMoney(selected.total)}</dd>
                </div>
                <div className="flex justify-between pt-1">
                  <dt>Payment</dt>
                  <dd className="text-gray-900">{getPayment(selected)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Full order details */}
          {showFull && (
            <div className="grid gap-6 border-t border-gray-200 bg-gray-50/60 p-5 text-sm md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900">Shipping address</h3>
                {selected.shippingAddress ? (
                  <address className="mt-2 not-italic leading-6 text-gray-600">
                    {selected.shippingAddress.fullName}
                    <br />
                    {selected.shippingAddress.phone}
                    <br />
                    {selected.shippingAddress.addressLine1}
                    {selected.shippingAddress.addressLine2 && (
                      <>
                        <br />
                        {selected.shippingAddress.addressLine2}
                      </>
                    )}
                    <br />
                    {[
                      selected.shippingAddress.city,
                      selected.shippingAddress.province,
                      selected.shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    <br />
                    {selected.shippingAddress.country}
                  </address>
                ) : (
                  <p className="mt-2 text-gray-400">No address on file.</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Customer notes</h3>
                <p className="mt-2 text-gray-600">{selected.notes || "No notes."}</p>
                {selected.couponCode && (
                  <p className="mt-3 text-gray-600">
                    Coupon: <span className="font-medium text-gray-900">{selected.couponCode}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}