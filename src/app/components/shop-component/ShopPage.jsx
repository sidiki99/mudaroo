"use client";

import { useMemo, useState } from "react";
import {
  products,
  categories,
  tags,
  brands,
  priceRanges,
  sortOptions,
} from "./ShopData";

const PAGE_SIZE = 12;

/* ---------- small pieces ---------- */

function HatchDivider() {
  return (
    <div
      aria-hidden
      className="mb-3 mt-2 h-2 w-full bg-[repeating-linear-gradient(-45deg,#d4d4d4_0,#d4d4d4_1px,transparent_1px,transparent_4px)]"
    />
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-light uppercase tracking-wide text-neutral-700">
        {title}
      </h3>
      <HatchDivider />
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function FilterItem({ label, active, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`text-left text-xs transition-colors hover:text-[#ff5a36] ${
          active ? "font-medium text-[#ff5a36]" : "text-neutral-600"
        }`}
      >
        {label}
      </button>
    </li>
  );
}

/* Built-in illustrations: shown whenever the real image file is missing,
   so the design always looks complete. */
function Illustration({ category }) {
  const stroke = "#9ca3af";
  const fill = "#e5e7eb";
  const common = { fill, stroke, strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" };

  const shapes = {
    Phones: (
      <>
        <rect x="38" y="10" width="44" height="80" rx="8" {...common} />
        <circle cx="60" cy="80" r="3" fill={stroke} />
      </>
    ),
    Tablets: (
      <>
        <rect x="22" y="18" width="76" height="62" rx="6" {...common} />
        <circle cx="60" cy="72" r="2.5" fill={stroke} />
      </>
    ),
    Watches: (
      <>
        <path d="M48 8h24l3 20H45zM45 72h30l-3 20H48z" {...common} />
        <rect x="38" y="28" width="44" height="44" rx="12" {...common} />
        <path d="M60 38v12l8 5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    Laptops: (
      <>
        <rect x="26" y="24" width="68" height="44" rx="4" {...common} />
        <path d="M14 72h92l-6 10H20z" {...common} />
      </>
    ),
    Accessories: (
      <>
        <path d="M30 62V54a30 30 0 0 1 60 0v8" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <rect x="24" y="58" width="14" height="26" rx="6" {...common} />
        <rect x="82" y="58" width="14" height="26" rx="6" {...common} />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 120 100" className="h-full w-full" role="img" aria-hidden>
      {shapes[category] ?? shapes.Accessories}
    </svg>
  );
}

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);

  if (failed || !product.image) {
    return <Illustration category={product.category} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  );
}

function ProductCard({ product }) {
  return (
    <article className="flex flex-col items-center rounded-lg border border-neutral-200/80 bg-white px-4 pb-4 pt-6 text-center hover:shadow-lg cursor-pointer ">
      <div className="h-28 w-full">
        <ProductImage product={product} />
      </div>
      <h3 className="mt-5 text-xs text-neutral-800">{product.name}</h3>
      <p className="mt-1 text-xs text-[#ff5a36]">${product.price}</p>
    </article>
  );
}

/* ---------- main component ---------- */

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceIndex, setPriceIndex] = useState(null); // index in priceRanges
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  // Any filter change sends the user back to page 1
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const toggleInList = (list, setter, value) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    category !== "All" ||
    selectedTags.length > 0 ||
    selectedBrands.length > 0 ||
    priceIndex !== null;

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSelectedTags([]);
    setSelectedBrands([]);
    setPriceIndex(null);
    setSort("default");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const range = priceIndex !== null ? priceRanges[priceIndex] : null;

    let list = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query)) return false;
      if (category !== "All" && p.category !== category) return false;
      if (selectedTags.length && !selectedTags.some((t) => p.tags.includes(t))) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (range && !(p.price >= range.min && p.price < range.max)) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [search, category, selectedTags, selectedBrands, priceIndex, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + visible.length;

  const goToPage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]">
        {/* ---------- products ---------- */}
        <div>
          <div className="mb-4 flex items-center justify-between text-xs text-neutral-600">
            <p>
              Showing {showingFrom}–{showingTo} of {filtered.length} results
            </p>

            <label className="flex items-center gap-2">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(e) => withReset(setSort)(e.target.value)}
                className="cursor-pointer bg-transparent text-xs text-neutral-600 focus:outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center">
              <p className="text-sm text-neutral-700">No products match your filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs text-[#ff5a36] underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-4 text-xs text-neutral-600"
            >
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:text-[#ff5a36] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-neutral-600"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={
                    n === currentPage
                      ? "font-semibold text-neutral-900"
                      : "hover:text-[#ff5a36]"
                  }
                >
                  {n}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="hover:text-[#ff5a36] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-neutral-600"
              >
                Next
              </button>
            </nav>
          )}
        </div>

        {/* ---------- sidebar ---------- */}
        <aside>
          {/* search */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mb-8 flex items-center gap-2 rounded-md border border-neutral-200 p-1.5"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => withReset(setSearch)(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-8 w-8 items-center justify-center rounded bg-[#ff5a36] text-white hover:bg-[#e8502e]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>

          <FilterGroup title="Categories">
            {categories.map((c) => (
              <FilterItem
                key={c}
                label={c}
                active={category === c}
                onClick={() => withReset(setCategory)(c)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Tags">
            {tags.map((t) => (
              <FilterItem
                key={t}
                label={t}
                active={selectedTags.includes(t)}
                onClick={() => toggleInList(selectedTags, setSelectedTags, t)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Brands">
            {brands.map((b) => (
              <FilterItem
                key={b}
                label={b}
                active={selectedBrands.includes(b)}
                onClick={() => toggleInList(selectedBrands, setSelectedBrands, b)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Filter by price">
            {priceRanges.map((r, i) => (
              <FilterItem
                key={r.label}
                label={r.label}
                active={priceIndex === i}
                onClick={() => withReset(setPriceIndex)(priceIndex === i ? null : i)}
              />
            ))}
          </FilterGroup>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-neutral-600 underline underline-offset-2 hover:text-[#ff5a36]"
            >
              Reset all filters
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}