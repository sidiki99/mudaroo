"use client"

import { Image, Link } from "lucide-react";
import { useMemo, useState } from "react";
import { Suspense } from "react";
import { useParams , useRouter} from "next/navigation";
import api from "@/lib/axios";
import { useEffect, useId, useRef,} from "react";
import { useDispatch,useSelector } from "react-redux";
import { addToCart } from "@/app/store/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/app/store/wishlistSlice";



export  default function ProductDetails(){
  return(
    <>
   <Suspense fallback={<div>Loading product...</div>}>
      <ProductDetail />
    </Suspense>

    {/* <RelatedItems /> */}
    {/* <LatestPosts />
    <BrandMarquee /> */}
    </>
  )
}



const money = (n) => `Rs. ${Number(n ?? 0).toLocaleString()}`;

 function ProductDetail() {
  const { slug } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);


  const dispatch = useDispatch();

  const wishlistItems = useSelector(
  (state) => state.wishlist.items
);

const isWishlisted = wishlistItems.some(
  (item) => item._id === product._id
);

function handleWishlist() {
  if (isWishlisted) {
    dispatch(removeFromWishlist(product._id));
  } else {
    dispatch(addToWishlist(product));
  }
}


 



  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${encodeURIComponent(slug)}`);

        if (!res.data.success) {
          throw new Error(res.data.message || "Could not fetch product.");
        }

        const fetched = res.data.filteredProduct;
        if (!fetched) throw new Error("Product not found.");

        if (cancelled) return;
        setProduct(fetched);

        // resolve category name from its id (non-fatal if it fails)
        try {
          const catRes = await api.get("/categories");
          const match = (catRes.data.categories ?? []).find(
            (c) => c._id === fetched.category
          );
          if (!cancelled) setCategoryName(match?.name ?? "");
        } catch {
          /* ignore */
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || err.message || "Failed to load product."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);


   
  if (loading) return <p>Loading product...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  /* ---------- derived data ---------- */

  const images = (product.images ?? []).map((img) =>
    typeof img === "string" ? img : img?.url
  );
  const mainImage = images[imageIndex] ?? images[0];

  const variants = product.variants ?? [];

  const colors = [];
  variants.forEach((v) => {
    if (!colors.some((c) => c.color === v.color)) {
      colors.push({ color: v.color, hex: v.colorHex });
    }
  });

  const activeColor = color ?? variants[0]?.color;
  const sizeVariants = variants.filter((v) => v.color === activeColor);
  const variant =
    sizeVariants.find((v) => v.size === size) ?? sizeVariants[0] ?? null;

  const price = variant?.price ?? 0;
  const oldPrice = variant?.oldPrice ?? 0;
  const stock = variant?.stock ?? 0;
  const soldOut = stock <= 0;
  const safeQty = soldOut ? 0 : Math.min(Math.max(1, qty), stock);
  const discount =
    oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  /* ---------- handlers ---------- */

  const chooseColor = (c) => {
    setColor(c);
    setSize(null);
    setQty(1);
  };

  const chooseSize = (s) => {
    setSize(s);
    setQty(1);
  };

 
const cartItem = variant && {
  productId: product._id,
  variantId: variant._id,
  slug: product.slug,
  name: product.name,
  image: images[0],
  sku: variant.sku,
  color: variant.color,
  size: variant.size,
  price: variant.price,
  quantity: safeQty,
};


const onAddToCart = (item) => {
  if (!item) {
    alert("Please select a product variant.");
    return false;
  }

  if (!item.variantId || !item.productId) {
    alert("Product or variant information is missing.");
    return false;
  }

  dispatch(
    addToCart({
      product: {
        _id: item.productId,
        name: item.name,
        slug: item.slug,
        images: item.image ? [item.image] : [],
        price: item.price,
      },
      variantId: item.variantId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      sku: item.sku,
      image: item.image,
    })
  );

  alert("Product added to cart successfully!");
  return true;
};

const onOrderNow = (item) => {
  const added = onAddToCart(item);

  if (added) {
    router.push("/checkout");
  }
};



  /* ---------- UI ---------- */

  return (
  <>  
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 font-light text-neutral-800 md:grid-cols-[72px_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-3">
      {/* Thumbnails */}
      <div className="order-2 flex gap-2 md:order-none md:flex-col">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setImageIndex(i)}
            aria-pressed={i === imageIndex}
            aria-label={`Show image ${i + 1}`}
            className={`flex h-20 w-[68px] items-center justify-center rounded border bg-white p-1.5 transition ${
              i === imageIndex
                ? "border-[#ff6a45]"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="max-h-full object-contain" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="order-1 flex min-h-[320px] items-center justify-center rounded border border-neutral-200 bg-white p-6 md:order-none md:min-h-[420px]">
        {mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={product.name}
            className="max-h-[340px] object-contain"
          />
        )}
      </div>

      {/* Details */}
      <div className="order-3 md:order-none md:pl-7">
        <h1 className="text-3xl uppercase tracking-wide md:text-4xl">
          {product.name}
        </h1>

        <div className="mt-2 flex items-center gap-3">
          <p className="text-lg text-[#e8502f]">{money(price)}</p>
          {discount > 0 && (
            <>
              <p className="text-sm text-neutral-400 line-through">
                {money(oldPrice)}
              </p>
              <span className="rounded bg-[#ff6a45] px-1.5 py-0.5 text-[11px] text-white">
                -{discount}%
              </span>
            </>
          )}
        </div>

        <p className="mt-3 max-w-prose text-neutral-500">{product.description}</p>
        <hr className="my-4 border-neutral-200" />

        {/* Color */}
        {colors.length > 0 && (
          <fieldset className="mb-3">
            <legend className="mb-1 underline underline-offset-4">
              Color: <span className="no-underline">{activeColor}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => {
                const active = activeColor === c.color;
                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => chooseColor(c.color)}
                    aria-pressed={active}
                    aria-label={c.color}
                    title={c.color}
                    className={`h-6 w-6 rounded-full border-2 transition ${
                      active
                        ? "border-[#ff6a45]"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                    style={{ backgroundColor: c.hex || "#ddd" }}
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Size */}
        {sizeVariants.length > 0 && (
          <fieldset className="mb-3">
            <legend className="mb-1 underline underline-offset-4">Size</legend>
            <div className="flex flex-wrap gap-1.5">
              {sizeVariants.map((v) => {
                const active = variant?.size === v.size;
                return (
                  <button
                    key={v.sku}
                    type="button"
                    onClick={() => chooseSize(v.size)}
                    aria-pressed={active}
                    disabled={v.stock <= 0}
                    className={`rounded px-1.5 py-0.5 transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                      active
                        ? "font-normal text-neutral-900 shadow-[inset_0_-2px_0_#ff6a45]"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <p
          className={`mt-3 ${
            soldOut ? "text-red-600" : stock <= 5 ? "text-[#e8502f]" : ""
          }`}
        >
          {soldOut ? "Out of stock" : `${stock} in stock`}
        </p>

        {/* Quantity */}
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty(Math.max(1, safeQty - 1))}
            disabled={soldOut}
            className="h-8 w-8 rounded border border-neutral-200 bg-white disabled:opacity-40"
          >
            -
          </button>
          <output className="flex h-8 w-14 items-center justify-center rounded border border-neutral-200 bg-white">
            {safeQty}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty(Math.min(stock, safeQty + 1))}
            disabled={soldOut || safeQty >= stock}
            className="h-8 w-8 rounded border border-neutral-200 bg-white disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onOrderNow(cartItem)}
            className="h-8 cursor-pointer rounded-full bg-[#ff6a45] px-5 text-xs uppercase tracking-widest text-white transition hover:bg-[#e8502f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Order now
          </button>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onAddToCart(cartItem)}
            className="h-8 cursor-pointer rounded-full bg-neutral-900 px-5 text-xs uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to cart
          </button>
          <button
           onClick={handleWishlist}
            type="button"
            aria-pressed={ isWishlisted}
            aria-label={ isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            // onClick={() => setWished(! isWishlisted}
            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition ${
               isWishlisted ? "bg-[#ff6a45]" : "bg-neutral-900 hover:bg-neutral-700"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3 5 6.5 5c2 0 3.5 1.2 5.5 3.2C14 6.2 15.5 5 17.5 5 21 5 22.8 8.6 21.5 11.8 19.5 16.4 12 21 12 21z" />
            </svg>
          </button>
        </div>

        <hr className="my-5 border-neutral-200" />

        <dl className="space-y-0.5 text-[13px]">
          {variant?.sku && (
            <div>
              <dt className="inline font-normal">SKU: </dt>
              <dd className="inline">{variant.sku}</dd>
            </div>
          )}
          {categoryName && (
            <div>
              <dt className="inline font-normal">Category: </dt>
              <dd className="inline">{categoryName}</dd>
            </div>
          )}
          {product.audience && (
            <div>
              <dt className="inline font-normal">For: </dt>
              <dd className="inline">{product.audience}</dd>
            </div>
          )}
          {product.brand && (
            <div>
              <dt className="inline font-normal">Brand: </dt>
              <dd className="inline">{product.brand}</dd>
            </div>
          )}
          {product.material && (
            <div>
              <dt className="inline font-normal">Material: </dt>
              <dd className="inline">{product.material}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
     <ProductTabs product={product} categoryName={categoryName} />
  </>
  );
}



const sampleReviews = [
  { id: 1, name: "Emma Chamberlin", date: "2022-11-22", rating: 5, photo: "", text: "Vitae tortor condimentum lacinia quis vel eros donec ac. Nam at lectus urna duis convallis convallis" },
  { id: 2, name: "Thompson J.", date: "2022-11-22", rating: 5, photo: "", text: "Vitae tortor condimentum lacinia quis vel eros donec ac. Nam at lectus urna duis convallis convallis" },
];

const TABS = [
  { id: "description", label: "Description" },
  { id: "info", label: "Additional information" },
  { id: "reviews", label: "Reviews" },
];

const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
};

function Stars({ value, size = "text-[10px]" }) {
  return (
    <span className={`${size} tracking-widest`} role="img" aria-label={`${value} out of 5 stars`}>
      <span className="text-[#ff6a45]">{"★".repeat(value)}</span>
      <span className="text-neutral-300">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function Avatar({ name, photo }) {
  if (photo) return <img src={photo} alt="" className="h-11 w-11 rounded object-cover" />;
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded bg-neutral-200 text-xs text-neutral-600" aria-hidden="true">
      {initials}
    </span>
  );
}

function RatingInput({ value, onChange, describedBy }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Your rating" aria-describedby={describedBy} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className={`text-lg leading-none transition ${n <= shown ? "text-[#ff6a45]" : "text-neutral-300"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff6a45]`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded border border-neutral-200 bg-white px-3 py-3 text-[13px] text-neutral-800 placeholder:text-neutral-500 focus:border-[#ff6a45] focus:outline-none focus:ring-1 focus:ring-[#ff6a45]";

function ReviewForm({ onAdd, onSubmitReview }) {
  const uid = useId();
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("review-author") || "{}"); } catch {}
    return { rating: 0, text: "", name: saved.name || "", email: saved.email || "", remember: !!saved.name, file: null };
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [serverError, setServerError] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.rating) e.rating = "Choose a star rating.";
    if (!form.text.trim()) e.text = "Write your review.";
    if (!form.name.trim()) e.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    return e;
  };

  const pickFile = (file) => {
    if (file && !file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, file: "Choose an image file." }));
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: "Image must be under 5 MB." }));
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    set("file", file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setStatus("sending");
    setServerError("");
    try {
      await onSubmitReview?.({ ...form });
      try {
        if (form.remember) localStorage.setItem("review-author", JSON.stringify({ name: form.name, email: form.email }));
        else localStorage.removeItem("review-author");
      } catch {}
      onAdd({
        id: Date.now(),
        name: form.name.trim(),
        date: new Date().toISOString(),
        rating: form.rating,
        photo: preview,
        text: form.text.trim(),
      });
      setPreview("");
      setForm((f) => ({ ...f, rating: 0, text: "", file: null }));
      if (fileRef.current) fileRef.current.value = "";
      setStatus("done");
    } catch (err) {
      setServerError(err?.message || "Could not send your review. Try again.");
      setStatus("error");
    }
  };

  const err = (k) => errors[k] && <p id={`${uid}-${k}`} className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <form onSubmit={submit} noValidate className="mt-6 text-[13px] text-neutral-600">
      <h3 className="text-xl font-light uppercase tracking-wide text-neutral-800">Add a review</h3>
      <p className="mt-4">Your email address will not be published. Required fields are marked *</p>

      <div className="mt-3">
        <p id={`${uid}-rating-label`}>Your rating *</p>
        <RatingInput value={form.rating} onChange={(n) => set("rating", n)} describedBy={errors.rating ? `${uid}-rating` : undefined} />
        {err("rating")}
      </div>

      <div className="mt-3">
        <p>Choose your photo</p>
        <div className="mt-1 flex items-center gap-3">
          <input ref={fileRef} id={`${uid}-file`} type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
          <label htmlFor={`${uid}-file`} className="cursor-pointer rounded border border-neutral-300 bg-neutral-100 px-3 py-0.5 text-xs text-neutral-800 hover:bg-neutral-200 focus-within:outline">
            {form.file ? "Change file" : "Choose your file"}
          </label>
          {preview && (
            <>
              <img src={preview} alt="Selected photo preview" className="h-8 w-8 rounded object-cover" />
              <span className="max-w-[12rem] truncate text-xs">{form.file?.name}</span>
              <button type="button" onClick={() => { pickFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs underline">Remove</button>
            </>
          )}
        </div>
        {err("file")}
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-text`} className="sr-only">Your review</label>
        <textarea id={`${uid}-text`} rows={3} placeholder="Write your review here *" value={form.text} onChange={(e) => set("text", e.target.value)} aria-invalid={!!errors.text} aria-describedby={errors.text ? `${uid}-text-err` : undefined} className={`${inputCls} resize-y`} />
        {errors.text && <p id={`${uid}-text-err`} className="mt-1 text-xs text-red-600">{errors.text}</p>}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="sr-only">Your name</label>
          <input id={`${uid}-name`} type="text" autoComplete="name" placeholder="Write your name here *" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} className={inputCls} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="sr-only">Your email</label>
          <input id={`${uid}-email`} type="email" autoComplete="email" placeholder="Write your email here *" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} className={inputCls} />
          {err("email")}
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2">
        <input type="checkbox" checked={form.remember} onChange={(e) => set("remember", e.target.checked)} className="h-3.5 w-3.5 accent-[#ff6a45]" />
        Save my name and email in this browser for the next time.
      </label>

      <div className="mt-4 flex items-center gap-4">
        <button type="submit" disabled={status === "sending"} className="h-9 rounded-full bg-[#ff6a45] px-6 text-[11px] uppercase tracking-widest text-white transition hover:bg-[#e8502f] disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Submit"}
        </button>
        <p role="status" className="text-xs">
          {status === "done" && <span className="text-green-700">Thanks, your review was added.</span>}
          {status === "error" && <span className="text-red-600">{serverError}</span>}
        </p>
      </div>
    </form>
  );
}

function ProductTabs({
  product,
  categoryName = "",
  initialReviews = sampleReviews,
  onSubmitReview,
}) {
  const [tab, setTab] = useState("description");
  const [reviews, setReviews] = useState(initialReviews);
  const tabRefs = useRef({});

  // Description: split the product description into paragraphs
  const description = useMemo(
    () =>
      String(product?.description ?? "")
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean),
    [product]
  );

  // Additional information: built from the real product data
  const info = useMemo(() => {
    const variants = product?.variants ?? [];
    const unique = (key) => [...new Set(variants.map((v) => v[key]).filter(Boolean))];

    const rows = [
      ["Brand", product?.brand],
      ["Material", product?.material],
      ["Audience", product?.audience],
      ["Category", categoryName],
      ["Colors", unique("color").join(", ")],
      ["Sizes", unique("size").join(", ")],
      ["Size type", unique("sizeType").join(", ")],
      ["Size system", unique("sizeSystem").join(", ")],
    ];

    return rows.filter(([, value]) => value);
  }, [product, categoryName]);

  const onKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 font-light text-neutral-800">
      <div role="tablist" aria-label="Product details" onKeyDown={onKey} className="flex flex-wrap justify-center gap-6 border-b border-neutral-200 pb-3 text-[13px] uppercase tracking-wide">
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => (tabRefs.current[t.id] = el)}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`transition ${tab === t.id ? "text-[#ff6a45]" : "text-neutral-700 hover:text-[#ff6a45]"}`}
          >
            {t.label}
            {t.id === "reviews" && ` (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Description */}
      <div role="tabpanel" id="panel-description" aria-labelledby="tab-description" hidden={tab !== "description"} className="pt-6 text-[13px] leading-relaxed text-neutral-600">
        <p className="mb-5">Product Description</p>
        {description.length > 0 ? (
          description.map((p, i) => (
            <p key={i} className="mb-4">{p}</p>
          ))
        ) : (
          <p className="mb-4">No description available.</p>
        )}
      </div>

      {/* Additional information */}
      <div role="tabpanel" id="panel-info" aria-labelledby="tab-info" hidden={tab !== "info"} className="pt-6 text-[13px]">
        {info.length > 0 ? (
          <table className="w-full max-w-xl border-collapse">
            <tbody>
              {info.map(([k, v]) => (
                <tr key={k} className="border-b border-neutral-200">
                  <th scope="row" className="w-40 py-2 pr-4 text-left font-normal">{k}</th>
                  <td className="py-2 text-neutral-600">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-neutral-500">No additional information available.</p>
        )}
      </div>

      {/* Reviews + form */}
      <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden={tab !== "reviews"} className="pt-6">
        {reviews.length === 0 && <p className="text-[13px] text-neutral-500">There are no reviews yet. Be the first to write one.</p>}
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-2">
              <Avatar name={r.name} photo={r.photo} />
              <div className="text-[13px]">
                <Stars value={r.rating} />
                <p className="text-neutral-800">
                  {r.name} <span className="text-neutral-500">- {fmtDate(r.date)}</span>
                </p>
                <p className="text-neutral-600">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <ReviewForm onAdd={(r) => setReviews((list) => [r, ...list])} onSubmitReview={onSubmitReview} />
      </div>
    </section>
  );
}

const categories = [
  { name: "Shoes", image: "/images/cat1.jpg", href: "/category/phones" },
  { name: "Electronics Devices", image: "/images/cat2.jpg", href: "/category/playstations" },
  { name: "Clothes", image: "/images/clothes.jpg", href: "/category/digital-watches" },
  { name: "PlayStations", image: "/images/cat3.jpg", href: "/category/joysticks" },
  { name: "Watches", image: "/images/cat4.jpg", href: "/category/earpods" },


 
];

 function RelatedItems() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
      
      {/* ---------- Categories heading with hatched line ---------- */}
      <div className="mt-24 flex items-center gap-3">
        <h2 className="text-xl font-light uppercase tracking-wide text-gray-700">
          Related Items
        </h2>
        <span
          aria-hidden="true"
          className="h-2.5 flex-1 bg-[repeating-linear-gradient(-45deg,#cbd5e1_0,#cbd5e1_1px,transparent_1px,transparent_4px)]"
        />
      </div>

      {/* ---------- Category cards ---------- */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ name, image, href }) => (
          <Link
            key={name}
            href={href}
            className="group flex h-44 flex-col items-center justify-between rounded-md border border-gray-200 bg-white px-3 pb-4 pt-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2694a]"
          >
            <div className="relative h-24 w-full">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(min-width: 1024px) 140px, 33vw"
                className="object-contain"
              />
            </div>
            <span className="text-sm font-light text-gray-700">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}