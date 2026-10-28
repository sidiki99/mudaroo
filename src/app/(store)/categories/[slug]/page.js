"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import PageHeader from "../../components/common/PageHeader";
// import PageHeader from "@/app/components/common/PageHeader";



function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [ products,setProducts]=useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   const { slug } = useParams();


 useEffect(() => {
  if (!slug) return;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesRes, productsRes] = await Promise.all([
  api.get("/categories"),
  api.get("/products"),
]);

const allCategories = categoriesRes.data.categories || [];
const allProducts = productsRes.data.products || [];

// Find the category whose slug matches the URL
const category = allCategories.find(
  (item) => item.slug === slug
);

if (!category) {
  throw new Error("Category not found.");
}

// Filter products using the category MongoDB ID
const filteredProducts = allProducts.filter((product) => {
  const categoryId = product.category?._id ?? product.category;

  return String(categoryId) === String(category._id);
});

setCategories([category]);
setProducts(filteredProducts);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
}, [slug]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
      

      {/* Categories heading */}
      <div className="mt-24 flex items-center gap-3">
        <h2 className="text-xl font-light uppercase tracking-wide text-gray-700">
         {categories[0]?.name}
        </h2>
        <span
          aria-hidden="true"
          className="h-2.5 flex-1 bg-[repeating-linear-gradient(-45deg,#cbd5e1_0,#cbd5e1_1px,transparent_1px,transparent_4px)]"
        />
      </div>

      {/* Category cards */}
      {loading ? (
        <p className="mx-auto p-8">Loading products...</p>
      ) : error ? (
        <p className="mx-auto p-8 text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="mx-auto p-8">No products available.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((product) => {
            
//             const rawImage =(product.images ?? []).map((img) =>
//               // typeof product.images === "string"
//               //   ? product.image[0]
//               //   : product.image?.url;
//               typeof img === "string" ? img : img?.url
// )

//             const imageSrc = rawImage
//               ? rawImage.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] ||
//                 rawImage.match(/https?:\/\/[^\s)]+/)?.[0] ||
//                 ""
//               : "";

            return (
              <Link
                key={product._id}
                href={`/product/${product.slug}`}
                className="group flex h-44 flex-col items-center justify-between rounded-md border border-gray-200 bg-white px-3 pb-4 pt-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2694a]"
              >
                <div className="relative h-24 w-full">
                  
                    <Image
                      src={
                        typeof product.images?.[0] === "string" || typeof product.images?.[1] === "string"
                          ? product.images[0] ||product.images[1]
                          : product.images?.[0]?.url || "/placeholder.png"
                      }
                      alt={product.name || "Product"}
                      fill
                      sizes="(min-width: 1024px) 180px, 50vw"
                      className="object-contain"
                    />
                  
                </div>

                <span className="text-sm font-light text-gray-700">
                  {product.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function page() {
  return (
    <div>
      <PageHeader
              title="Shop"
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
              ]}
            />
            <CategoriesSection />
      
    </div>
  )
}
