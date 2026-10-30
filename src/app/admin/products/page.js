
"use client";

import { useRouter } from "next/navigation";
// needed in Next.js App Router (remove if you use the Pages Router)

import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import api from "@/lib/axios";


// CHANGE THIS to your own API url
const API_URL = "/api/products";
const CATEGORY_URL = "/api/categories";

const PAGE_SIZE = 8;
const AUDIENCES = ["Men", "Women", "Children", "Unisex"];

const money = (n) => Number(n || 0).toLocaleString("en-PK");

// Helpers that read the variants array of one product
const totalStock = (p) => p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

const priceRange = (p) => {
  const prices = p.variants?.map((v) => v.price) || [];
  if (!prices.length) return "-";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? money(min) : `${money(min)} - ${money(max)}`;
};

// category can be a populated object { _id, name } or just an id string
const categoryName = (p) =>
  typeof p.category === "object" && p.category ? p.category.name : p.category;

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [audience, setAudience] = useState("All Audiences");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null); // product whose variants are expanded

    const router = useRouter();


  // ---------- Fetch ----------
const fetchProducts = async () => {
  try {
    setLoading(true);
    setError("");

    const [prodRes, catRes] = await Promise.all([
      axios.get(API_URL),
      axios.get(CATEGORY_URL),
    ]);

    const p = prodRes.data;
    const c = catRes.data;

    setProducts(Array.isArray(p) ? p : p.products ?? p.data ?? []);
    setCategoryList(Array.isArray(c) ? c : c.categories ?? c.data ?? []);
  } catch (err) {
    setError(err.response?.data?.message || "Could not load products.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---------- Actions ----------
  const handleDelete = async (id) => {
    if (!confirm("Delete this product and all its variants?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  // const handleEdit = (product) => {
  //   router.push(`/admin/products/${product._id}/edit`)
  //   console.log("edit", product);
  // };

  const handleAdd = () => {
    router.push("/admin/products/add")
    console.log("add product");
  };
const categoryName = (p) => {
  const id = typeof p.category === "object" ? p.category?._id : p.category;
  const found = categoryList.find((c) => c._id === id);
  return found ? found.name : "-";
};

  // ---------- Filters ----------
  // const categories = useMemo(
  //   () => ["All Categories", ...new Set(products.map(categoryName).filter(Boolean))],
  //   [products]
  // );

  const categories = useMemo(
  () => ["All Categories", ...categoryList.map((c) => c.name)],
  [categoryList]
);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.sku?.toLowerCase().includes(q));
      const matchCat = category === "All Categories" || categoryName(p) === category;
      const matchAud = audience === "All Audiences" || p.audience === audience;
      const matchStatus =
        status === "All Status" ||
        (status === "Active" ? p.isActive : !p.isActive);
      return matchSearch && matchCat && matchAud && matchStatus;
    });
  }, [products, search, category, audience, status]);

  useEffect(() => setPage(1), [search, category, audience, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const selectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500";

  return (
    <div className="mx-auto w-full max-w-7xl rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
        <div className="relative min-w-[220px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or SKU..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={selectClass}>
          <option>All Audiences</option>
          {AUDIENCES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <button
          onClick={handleAdd}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Audience</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Price (PKR)</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </td>
              </tr>
            )}

            {!loading && !error && pageItems.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              pageItems.map((p, i) => {
                const stock = totalStock(p);
                const isOpen = openId === p._id;

                return (
                  <Fragment key={p._id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{start + i + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-100" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{p.name}</span>
                              {p.isFeatured && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.brand || "No brand"}
                              {p.material ? ` · ${p.material}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700">{categoryName(p) || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{p.audience}</td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => setOpenId(isOpen ? null : p._id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                        >
                          {p.variants?.length || 0} variant{p.variants?.length === 1 ? "" : "s"}
                          <svg
                            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-900">{priceRange(p)}</td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            stock === 0
                              ? "font-semibold text-red-600"
                              : stock <= 10
                              ? "font-semibold text-amber-600"
                              : "text-gray-700"
                          }
                        >
                          {stock === 0 ? "Out of stock" : stock}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              console.log("Editing product:", p._id);
                              router.push(`/admin/products/${p._id}/edit`);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded variants */}
                    {isOpen && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 font-semibold text-gray-600">
                                  <th className="px-3 py-2">SKU</th>
                                  <th className="px-3 py-2">Color</th>
                                  <th className="px-3 py-2">Size</th>
                                  <th className="px-3 py-2">Type / System</th>
                                  <th className="px-3 py-2">Price (PKR)</th>
                                  <th className="px-3 py-2">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.variants.map((v) => (
                                  <tr key={v._id || v.sku} className="border-b border-gray-100 last:border-0">
                                    <td className="px-3 py-2 font-medium text-gray-800">{v.sku}</td>
                                    <td className="px-3 py-2">
                                      <span className="inline-flex items-center gap-2">
                                        <span
                                          className="h-4 w-4 rounded-full border border-gray-300"
                                          style={{ backgroundColor: v.colorHex || "#000000" }}
                                        />
                                        {v.color}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">{v.size}</td>
                                    <td className="px-3 py-2 text-gray-500">
                                      {v.sizeType} · {v.sizeSystem}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="font-semibold text-gray-900">{money(v.price)}</span>
                                      {v.oldPrice > 0 && (
                                        <span className="ml-2 text-gray-400 line-through">
                                          {money(v.oldPrice)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span
                                        className={
                                          v.stock === 0
                                            ? "font-semibold text-red-600"
                                            : v.stock <= 5
                                            ? "font-semibold text-amber-600"
                                            : "text-gray-700"
                                        }
                                      >
                                        {v.stock}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Footer / pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-gray-600">
        <p>
          Showing {filtered.length === 0 ? 0 : start + 1} to{" "}
          {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length} products
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`rounded-md px-3 py-1 ${
                n === page
                  ? "bg-orange-500 font-semibold text-white"
                  : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}