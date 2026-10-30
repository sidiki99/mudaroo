"use client"; // Next.js App Router

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ---- CHANGE THESE to your own routes ----
const PRODUCT_URL = "/api/admin/products"; // POST = create, PUT /:id = edit
const CATEGORY_URL = "/api/categories"; // returns your Category list
const AFTER_SAVE_ROUTE = "/admin/products"; // where to go after save

const AUDIENCES = ["Men", "Women", "Children", "Unisex"];
const SIZE_TYPES = ["Clothing", "Shoes", "Accessories", "One Size"];
const SIZE_SYSTEMS = ["International", "US", "UK", "EU", "PK"];
const MAX_IMAGES = 8;

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

let uid = 0;
const newVariant = () => ({
  key: ++uid,
  sku: "",
  color: "",
  colorHex: "#000000",
  size: "",
  sizeType: "Clothing",
  sizeSystem: "International",
  price: "",
  oldPrice: "",
  stock: "",
});

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold text-gray-700";

// Pass `product` (from your API) to use this form in Edit mode
export default function ProductForm({ product = null }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // const [form, setForm] = useState({
  //   name: product?.name ?? "",
  //   slug: product?.slug ?? "",
  //   description: product?.description ?? "",
  //   audience: product?.audience ?? "Unisex",
  //   category:
  //     (typeof product?.category === "object"
  //       ? product?.category?._id
  //       : product?.category) ?? "",
  //   brand: product?.brand ?? "",
  //   material: product?.material ?? "",
  //   isActive: product?.isActive ?? true,
  //   isFeatured: product?.isFeatured ?? false,
  // });

  const [form, setForm] = useState({
  name: product?.name ?? "",
  slug: product?.slug ?? "",
  description: product?.description ?? "",
  audience: product?.audience ?? "Unisex",

  category:
    product?.category?._id ??
    product?.category ??
    product?.categoryId?._id ??
    product?.categoryId ??
    "",

  brand: product?.brand ?? "",
  material: product?.material ?? "",
  isActive: product?.isActive ?? true,
  isFeatured: product?.isFeatured ?? false,
});
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const [variants, setVariants] = useState(
    product?.variants?.length
      ? product.variants.map((v) => ({
          ...newVariant(),
          ...v,
          oldPrice: v.oldPrice ?? "",
        }))
      : [newVariant()]
  );

  // images: old ones (urls already saved) + new ones (File objects)
  const [oldImages, setOldImages] = useState(product?.images ?? []);
  const [newImages, setNewImages] = useState([]); // { file, preview }
  const [dragging, setDragging] = useState(false);

  // ---------- Load categories ----------
  useEffect(() => {
    axios
      .get(CATEGORY_URL)
      .then((res) => {
        const d = res.data;
        setCategories(Array.isArray(d) ? d : d.categories ?? d.data ?? []);
      })
      .catch(() => setError("Could not load categories."));
  }, []);

  // free memory of previews
  useEffect(
    () => () => newImages.forEach((i) => URL.revokeObjectURL(i.preview)),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ---------- Handlers ----------
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onNameChange = (value) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  };

  const updateVariant = (key, field, value) =>
    setVariants((list) =>
      list.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    );

  const addVariant = () => setVariants((list) => [...list, newVariant()]);
  const removeVariant = (key) =>
    setVariants((list) =>
      list.length === 1 ? list : list.filter((v) => v.key !== key)
    );

  const addFiles = (fileList) => {
    const room = MAX_IMAGES - oldImages.length - newImages.length;
    const picked = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(room, 0))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (picked.length < fileList.length) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
    }
    setNewImages((list) => [...list, ...picked]);
  };

  const removeNewImage = (index) =>
    setNewImages((list) => {
      URL.revokeObjectURL(list[index].preview);
      return list.filter((_, i) => i !== index);
    });

  const totalImages = oldImages.length + newImages.length;

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.category) return setError("Please select a category.");
    if (totalImages === 0) return setError("Please add at least one image.");

    // for (const v of variants) {
    //   if (!v.sku.trim() || !v.color.trim() || !v.size.trim() || v.price === "") {
    //     return setError("Each variant needs SKU, color, size and price.");
    //   }
    // }

    for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const missing = [];

        if (!v.sku.trim()) missing.push("SKU");
        if (!v.color.trim()) missing.push("Color name");
        if (!v.size.trim()) missing.push("Size");
        if (String(v.price).trim() === "") missing.push("Price");

        if (missing.length > 0) {
          return setError(`Variant ${i + 1} is missing: ${missing.join(", ")}`);
        }
      }

    // build the variants exactly like your Mongoose variantSchema
    const cleanVariants = variants.map((v) => ({
      ...(v._id ? { _id: v._id } : {}),
      sku: v.sku.trim().toUpperCase(),
      color: v.color.trim(),
      colorHex: v.colorHex || "#000000",
      size: v.size.trim(),
      sizeType: v.sizeType,
      sizeSystem: v.sizeSystem,
      price: Number(v.price),
      oldPrice: v.oldPrice === "" ? null : Number(v.oldPrice),
      stock: v.stock === "" ? 0 : Number(v.stock),
    }));

    // same field names your POST route reads from formData
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("slug", form.slug);
    fd.append("description", form.description);
    fd.append("audience", form.audience);
    fd.append("category", form.category);
    fd.append("brand", form.brand);
    fd.append("material", form.material);
    fd.append("isActive", String(form.isActive));
    fd.append("isFeatured", String(form.isFeatured));
    fd.append("variants", JSON.stringify(cleanVariants));
    newImages.forEach((img) => fd.append("images", img.file));
    if (isEdit) fd.append("existingImages", JSON.stringify(oldImages));

    try {
      setSaving(true);
      if (isEdit) {
        await axios.put(`${PRODUCT_URL}/${product._id}`, fd);
      } else {
        await axios.post(PRODUCT_URL, fd);
      }
      router.push(AFTER_SAVE_ROUTE);
      router.refresh();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.duplicateField
          ? `${data.message}: ${JSON.stringify(data.duplicateField)}`
          : data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-7xl rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add / Edit Product"}
        </h2>
        <p className="text-xs text-gray-500">
          Fill in the details to add a new product or edit existing product
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* ---------- LEFT: details ---------- */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Product Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Cotton Polo Shirt"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Slug *</label>
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", slugify(e.target.value));
              }}
              placeholder="cotton-polo-shirt"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Audience *</label>
              <select
                required
                value={form.audience}
                onChange={(e) => setField("audience", e.target.value)}
                className={inputClass}
              >
                {AUDIENCES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setField("brand", e.target.value)}
                placeholder="e.g. Nike"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Material</label>
              <input
                value={form.material}
                onChange={(e) => setField("material", e.target.value)}
                placeholder="e.g. 100% Cotton"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <button
                type="button"
                onClick={() => setField("isActive", !form.isActive)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  form.isActive
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-300 bg-gray-50 text-gray-600"
                }`}
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition ${
                    form.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                      form.isActive ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <div>
              <label className={labelClass}>Featured</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setField("isFeatured", e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                Show as featured
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Write a short description of the product"
              className={inputClass}
            />
          </div>
        </div>

        {/* ---------- RIGHT: images ---------- */}
        <div>
          <label className={labelClass}>
            Product Images * ({totalImages}/{MAX_IMAGES})
          </label>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition ${
              dragging
                ? "border-orange-400 bg-orange-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <svg
              className="mb-2 h-9 w-9 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP up to {MAX_IMAGES} images</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {/* previews */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {oldImages.map((src, i) => (
              <Thumb
                key={src}
                src={src}
                onRemove={() => setOldImages((l) => l.filter((_, x) => x !== i))}
              />
            ))}
            {newImages.map((img, i) => (
              <Thumb
                key={img.preview}
                src={img.preview}
                onRemove={() => removeNewImage(i)}
              />
            ))}
            {totalImages < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-2xl text-gray-500 hover:bg-gray-100"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------- VARIANTS ---------- */}
      <div className="border-t border-gray-200 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Variants *</h3>
            <p className="text-xs text-gray-500">
              Each color / size combination has its own SKU, price and stock.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-lg border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50"
          >
            + Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={v.key}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  Variant {idx + 1}
                </span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(v.key)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <label className={labelClass}>SKU *</label>
                  <input
                    value={v.sku}
                    onChange={(e) =>
                      updateVariant(v.key, "sku", e.target.value.toUpperCase())
                    }
                    placeholder="POLO-BLK-M"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Color *</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={v.colorHex}
                      onChange={(e) =>
                        updateVariant(v.key, "colorHex", e.target.value)
                      }
                      className="h-9 w-10 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
                    />
                    <input
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(v.key, "color", e.target.value)
                      }
                      placeholder="Black"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Size *</label>
                  <input
                    value={v.size}
                    onChange={(e) => updateVariant(v.key, "size", e.target.value)}
                    placeholder="M"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={v.stock}
                    onChange={(e) => updateVariant(v.key, "stock", e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Size Type</label>
                  <select
                    value={v.sizeType}
                    onChange={(e) =>
                      updateVariant(v.key, "sizeType", e.target.value)
                    }
                    className={inputClass}
                  >
                    {SIZE_TYPES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size System</label>
                  <select
                    value={v.sizeSystem}
                    onChange={(e) =>
                      updateVariant(v.key, "sizeSystem", e.target.value)
                    }
                    className={inputClass}
                  >
                    {SIZE_SYSTEMS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Price (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    value={v.price}
                    onChange={(e) => updateVariant(v.key, "price", e.target.value)}
                    placeholder="1999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Compare At Price (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={v.oldPrice}
                    onChange={(e) =>
                      updateVariant(v.key, "oldPrice", e.target.value)
                    }
                    placeholder="2499"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
        <button
          type="button"
          onClick={() => router.push(AFTER_SAVE_ROUTE)}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}

// small image preview box with a remove button
function Thumb({ src, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-red-600"
        aria-label="Remove image"
      >
        ×
      </button>
    </div>
  );
}