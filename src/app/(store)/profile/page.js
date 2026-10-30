"use client";

import { useCallback, useEffect, useState } from "react";

const API = "/api/profile";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
];

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  province: "",
  postalCode: "",
};

// If your API reads the JWT from an Authorization header instead of a cookie, add it here.
const authHeaders = () => ({ "Content-Type": "application/json" });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

async function request(url, options = {}) {
  const res = await fetch(url, { credentials: "include", headers: authHeaders(), ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ------------------------------ Address modal ------------------------------ */

function AddressModal({ address, onClose, onSaved }) {
  const isEdit = Boolean(address);
  const [form, setForm] = useState(
    address
      ? {
          fullName: address.fullName || "",
          phone: address.phone || "",
          addressLine: address.addressLine || "",
          city: address.city || "",
          province: address.province || "",
          postalCode: address.postalCode || "",
        }
      : EMPTY_ADDRESS
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Keep a saved province selectable even if it isn't in the list
  const provinceOptions =
    form.province && !PROVINCES.includes(form.province) ? [form.province, ...PROVINCES] : PROVINCES;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await request(isEdit ? `${API}/addresses/${address._id}` : `${API}/addresses`, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      onSaved(data.addresses, data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? "Edit address" : "Add address"}
        </h2>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={inputCls}
                placeholder="Sara Ali"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputCls}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input
              required
              value={form.addressLine}
              onChange={(e) => set("addressLine", e.target.value)}
              className={inputCls}
              placeholder="House no, street, area"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputCls}
                placeholder="Islamabad"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Province</label>
              <select
                required
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className={inputCls}
              >
                <option value="">Select province</option>
                {provinceOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:w-1/2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Postal code <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              className={inputCls}
              placeholder="44000"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add address"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------- Delete dialog ------------------------------ */

function DeleteAddressModal({ address, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await request(`${API}/addresses/${address._id}`, { method: "DELETE" });
      onDeleted(data.addresses, data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete address</h2>
        <p className="mt-2 text-sm text-gray-600">
          Delete the address for{" "}
          <span className="font-medium text-gray-900">{address.fullName || "this contact"}</span> in{" "}
          {address.city}? This can’t be undone.
        </p>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", address? }
  const [notice, setNotice] = useState(null); // { type: "ok" | "err", text }

  const flash = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await request(API, { cache: "no-store" });
      setUser(data.user);
      setName(data.user.name);
    } catch (err) {
      if (err.status === 401) setUnauthorized(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const data = await request(API, { method: "PATCH", body: JSON.stringify({ name }) });
      setUser(data.user);
      setName(data.user.name);
      flash("ok", "Profile updated.");
    } catch (err) {
      flash("err", err.message);
    } finally {
      setSavingName(false);
    }
  };

  const onAddressesChanged = (addresses, message) => {
    setUser((u) => ({ ...u, addresses }));
    setModal(null);
    flash("ok", message);
  };

  /* ------------------------------ States ------------------------------ */
  if (loading) {
    return <div className="p-10 text-center text-sm text-gray-400">Loading your profile…</div>;
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Please log in</h1>
        <p className="mt-2 text-sm text-gray-500">You need to be signed in to view your profile.</p>
        <a
          href="/login"
          className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Go to login
        </a>
      </div>
    );
  }

  if (error || !user) {
    return <div className="p-10 text-center text-sm text-red-500">{error || "Profile not found."}</div>;
  }

  const nameChanged = name.trim() !== user.name;

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your personal details and delivery addresses.</p>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${
            notice.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Personal information */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-4 border-b border-gray-200 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg font-bold text-orange-600">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-gray-900">{user.name}</h2>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
            <p className="mt-0.5 text-xs text-gray-400">Member since {fmtDate(user.createdAt)}</p>
          </div>
        </div>

        <form onSubmit={saveName} className="p-5">
          <h3 className="text-sm font-semibold text-gray-900">Personal information</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                value={user.email}
                readOnly
                disabled
                className={`${inputCls} cursor-not-allowed bg-gray-50 text-gray-500`}
              />
              <p className="mt-1 text-xs text-gray-400">
                {user.authProvider === "google"
                  ? "Signed in with Google. Email can’t be changed."
                  : "Email is set when you sign up and can’t be changed."}
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setName(user.name)}
              disabled={!nameChanged || savingName}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!nameChanged || savingName}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingName ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Addresses */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Delivery addresses ({user.addresses.length})
            </h3>
            <p className="mt-1 text-xs text-gray-500">Used to fill in your details at checkout.</p>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            + Add Address
          </button>
        </div>

        {user.addresses.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
            <p className="text-sm text-gray-500">You haven’t saved any addresses yet.</p>
            <button
              onClick={() => setModal({ type: "add" })}
              className="mt-3 rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {user.addresses.map((a) => (
              <div key={a._id} className="flex flex-col justify-between rounded-xl border border-gray-200 p-4">
                <address className="text-sm not-italic leading-6 text-gray-600">
                  <span className="font-semibold text-gray-900">{a.fullName || "—"}</span>
                  <br />
                  {a.phone}
                  <br />
                  {a.addressLine}
                  <br />
                  {[a.city, a.province, a.postalCode].filter(Boolean).join(", ")}
                </address>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setModal({ type: "edit", address: a })}
                    className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setModal({ type: "delete", address: a })}
                    className="rounded-lg border border-orange-300 px-4 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <AddressModal
          key={modal.address?._id || "new"}
          address={modal.address}
          onClose={() => setModal(null)}
          onSaved={onAddressesChanged}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteAddressModal
          address={modal.address}
          onClose={() => setModal(null)}
          onDeleted={onAddressesChanged}
        />
      )}
    </div>
  );
}