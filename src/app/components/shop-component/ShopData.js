"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export const priceRanges = [
  { label: "Under Rs. 1,000", min: 0, max: 1000 },
  { label: "Rs. 1,000 - 3,000", min: 1000, max: 3000 },
  { label: "Rs. 3,000 - 5,000", min: 3000, max: 5000 },
  { label: "Rs. 5,000 and above", min: 5000, max: Infinity },
];

export const sortOptions = [
  { label: "Default sorting", value: "default" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
];

export default function useBaseProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchShopData() {
      try {
        setLoading(true);
        setError("");

        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        if (!productsRes.data.success) {
          throw new Error(productsRes.data.message || "Could not fetch products.");
        }
        if (!categoriesRes.data.success) {
          throw new Error(categoriesRes.data.message || "Could not fetch categories.");
        }

        const activeCategories = (categoriesRes.data.categories ?? []).filter(
          (c) => c.isActive !== false
        );

        // id -> name map so products can resolve their category name
        const categoryMap = {};
        activeCategories.forEach((c) => {
          categoryMap[c._id] = c.name;
        });

        const formattedProducts = (productsRes.data.products ?? []).map((p) => {
          const rawCategory = p.category ?? p.categoryId;
          const categoryId =
            rawCategory && typeof rawCategory === "object"
              ? rawCategory._id
              : rawCategory;
          const categoryName =
            rawCategory && typeof rawCategory === "object"
              ? rawCategory.name
              : categoryMap[categoryId] ?? p.categoryName ?? "";

          const firstImage = p.images?.[0];
          const image =
            (typeof firstImage === "string" ? firstImage : firstImage?.url) ??
            p.image ??
            p.thumbnail ??
            "";

          return {
            id: p._id,
            name: p.name ?? "Unnamed product",
            slug: p.slug ?? p._id,
            price: Number(p.price ?? p.variants?.[0]?.price ?? 0),
            image,
            category: categoryName,
            brand:
              p.brand && typeof p.brand === "object" ? p.brand.name ?? "" : p.brand ?? "",
            tags: Array.isArray(p.tags)
              ? p.tags.map((t) => (typeof t === "object" ? t.name : t))
              : [],
          };
        });

        if (cancelled) return;

        setProducts(formattedProducts);
        setCategories(["All", ...activeCategories.map((c) => c.name)]);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || err.message || "Failed to load shop data."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchShopData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, categories, loading, error };
}