"use client";
import Link from "next/link";

import { useMemo, useState } from "react";
import useBaseProducts, { priceRanges, sortOptions } from "./ShopData";

const PAGE_SIZE = 12;

function FilterGroup({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-light uppercase tracking-wide text-neutral-700">
        {title}
      </h3>
      <div
        aria-hidden
        className="mb-3 mt-2 h-2 w-full bg-[repeating-linear-gradient(-45deg,#d4d4d4_0,#d4d4d4_1px,transparent_1px,transparent_4px)]"
      />
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

function ProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="block"
      aria-label={product.name}
    >
      <article className="flex h-full cursor-pointer flex-col items-center rounded-lg border border-neutral-200/80 bg-white px-4 pb-4 pt-6 text-center hover:shadow-lg">
        <div className="h-28 w-full">
          {product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <h3 className="mt-5 text-xs text-neutral-800">{product.name}</h3>
        <p className="mt-1 text-xs text-[#ff5a36]">Rs. {product.price}</p>
      </article>
    </Link>
  );
}

export default function ShopPage() {
  const { products, categories, loading, error } = useBaseProducts();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceIndex, setPriceIndex] = useState(null);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  const tags = useMemo(
    () => [...new Set(products.flatMap((p) => p.tags))],
    [products]
  );

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const range = priceIndex !== null ? priceRanges[priceIndex] : null;

    let list = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query)) return false;
      if (category !== "All" && p.category !== category) return false;
      if (selectedTags.length && !selectedTags.some((t) => p.tags.includes(t)))
        return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (range && !(p.price >= range.min && p.price < range.max)) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name-asc")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, search, category, selectedTags, selectedBrands, priceIndex, sort]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{String(error)}</p>;
  if (products.length === 0) return <p>No products found.</p>;

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
        {/* products */}
        <div>
          <div className="mb-4 flex items-center justify-between text-xs text-neutral-600">
            <p>
              Showing {showingFrom}–{showingTo} of {filtered.length} results
            </p>
            <select
              value={sort}
              onChange={(e) => withReset(setSort)(e.target.value)}
              aria-label="Sort products"
              className="cursor-pointer bg-transparent text-xs text-neutral-600 focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-8 flex items-center justify-center gap-4 text-xs text-neutral-600"
            >
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="hover:text-[#ff5a36] disabled:cursor-not-allowed disabled:opacity-40"
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
                className="hover:text-[#ff5a36] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>

        {/* sidebar */}
        <aside>
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

          {tags.length > 0 && (
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
          )}

          {brands.length > 0 && (
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
          )}

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