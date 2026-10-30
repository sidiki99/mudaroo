"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API = "/api/admin/categories";
const PAGE_SIZE = 6;

const slugify = (v) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ------------------------------ Category form ------------------------------ */

function CategoryModal({ category, categories, onClose, onSaved }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    parent: category?.parent?._id || category?.parent || "",
    sortOrder: category?.sortOrder ?? 0,
    isActive: category?.isActive ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(category?.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onName = (value) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("slug", form.slug);
      fd.append("description", form.description);
      fd.append("sortOrder", String(form.sortOrder));
      fd.append("isActive", String(form.isActive));
      if (form.parent) fd.append("parent", form.parent);
      if (file) fd.append("image", file);

      const res = await fetch(isEdit ? `${API}/${category._id}` : API, {
        method: isEdit ? "PUT" : "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? "Edit category" : "Add category"}
        </h2>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No image</span>
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose image
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => onName(e.target.value)}
              className={inputCls}
              placeholder="Phones"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              className={inputCls}
              placeholder="phones"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Parent category
              </label>
              <select
                value={form.parent}
                onChange={(e) => set("parent", e.target.value)}
                className={inputCls}
              >
                <option value="">None</option>
                {categories
                  .filter((c) => c._id !== category?._id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sort order</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 accent-orange-500"
            />
            Active
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add category"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------- Delete dialog ------------------------------ */

function DeleteModal({ category, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/${category._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete category");
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Delete category</h2>
        <p className="mt-2 text-sm text-gray-600">
          Delete <span className="font-medium text-gray-900">{category.name}</span>? This can’t be
          undone.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
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

/* ---------------------------------- Page ----------------------------------- */

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", category? }

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load categories");
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = categories.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const rows = useMemo(
    () => categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [categories, page]
  );

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const refresh = () => {
    setModal(null);
    load();
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Organize your products with categories.</p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          + Add Category
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Loading categories…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No categories yet. Add your first one.
                  </td>
                </tr>
              )}

              {rows.map((c, i) => (
                <tr key={c._id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-700">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-gray-400">No image</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-700">{c.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${
                        c.isActive
                          ? "border-green-200 bg-green-50 text-green-600"
                          : "border-gray-200 bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ type: "edit", category: c })}
                        className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setModal({ type: "delete", category: c })}
                        className="rounded-lg border border-orange-300 px-4 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing {from} to {to} of {total} categories
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

      {(modal?.type === "add" || modal?.type === "edit") && (
        <CategoryModal
          category={modal.category}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}

      {modal?.type === "delete" && (
        <DeleteModal
          category={modal.category}
          onClose={() => setModal(null)}
          onDeleted={refresh}
        />
      )}
    </div>
  );
}