// 

"use client";

import { useState ,useEffect} from "react";
import Image from "next/image";
import { Outfit } from "next/font/google";
import LatestPosts from "./components/common/LatestPosts"
import BrandMarquee from "./components/common/BrandMarquee"
import Link from "next/link";
import { ShoppingCart, Trophy, BadgePercent, MessageCircleCheck } from "lucide-react";
import BestSellingCarousel from "./components/home-components/BestSeller";
import api from "@/lib/axios";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400"] });

const arrowClass =
  "absolute top-1/2 -mt-[15px] h-[30px] w-6 rounded-[3px] border border-neutral-300 " +
  "text-sm leading-none text-neutral-400 hover:text-neutral-600 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[#ff6a3d] dark:border-neutral-600";


export default function Home(){
  return(
    <>
     <HeroSection />
     <CategoriesSection />
     <DiscountedProducts />
     <ProductColumns />
     {/* <LatestPosts /> */}
     <BrandMarquee />

    </>
  )
}


 function HeroSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [i, setI] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        if (response.data.success) {
          const fetchedProducts =
            response.data.products ?? [];

          setProducts(fetchedProducts);
        } else {
          setError("Could not fetch products.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Move to the previous or next product
  const go = (direction) => {
    if (products.length === 0) return;

    setI(
      (current) =>
        (current + direction + products.length) %
        products.length
    );
  };

  // Show only the selected product
  const product = products[i];

  // Support either string image URLs or { url } objects
 const rawImage =
        typeof product?.images?.[0] === "string"
          ? product.images[0]
          : product?.images?.[0]?.url;

      const imageSrc = rawImage
        ? rawImage.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] ||
          rawImage.match(/https?:\/\/[^\s)]+/)?.[0] ||
          ""
        : "";

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label="Featured products"
        className={`${outfit.className} relative flex min-h-[290px] items-center overflow-hidden bg-[#f5f5f5] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`}
      >
        {loading ? (
          <p className="mx-auto p-8">Loading products...</p>
        ) : error ? (
          <p className="mx-auto p-8 text-red-600">
            {error}
          </p>
        ) : !product ? (
          <p className="mx-auto p-8">
            No products available.
          </p>
        ) : (
          <>
            {products.length > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className={`${arrowClass} left-2.5 md:left-[42px]`}
              >
                &#8249;
              </button>
            )}

            <div
              key={product._id}
              className="mx-auto flex min-h-[290px] w-full max-w-[1100px] flex-col items-center justify-between gap-6 px-14 py-8 text-center md:flex-row md:px-[90px] md:py-0 md:text-left"
            >
              {/* Product text */}
              <div className="md:basis-[38%] md:shrink-0 md:grow-0">
                <h1 className="mb-2.5 text-[clamp(22px,2.8vw,32px)] font-light uppercase tracking-[0.04em]">
                  {product.title || product.name}
                </h1>

                <p className="mb-[22px] text-[13px] font-light text-neutral-600 dark:text-neutral-300">
                  {product.text ||
                    product.description ||
                    "Discover our latest collection."}
                </p>

                <a
                  href={`/products/${product.slug}`}
                  className="inline-block rounded-full bg-[#ff6a3d] px-[26px] py-2.5 text-[10px] uppercase tracking-[0.1em] text-white hover:brightness-95"
                >
                  Shop Now
                </a>
              </div>

              {/* Product image */}
              <div className="flex justify-center md:basis-[52%] md:shrink-0 md:grow-0">
                <div className="relative aspect-square w-[min(340px,70vw)] rounded-full bg-[#e9e9e9] dark:bg-neutral-700 md:-mb-[60px] md:mt-[60px]">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      alt={product.name || product.title || "Product"}
                      width={420}
                      height={340}
                      priority={i === 0}
                      className="absolute left-1/2 top-1/2 h-auto w-[120%] max-w-none -translate-x-[45%] -translate-y-[62%]"
                    />
                  )}
                </div>
              </div>
            </div>

            {products.length > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className={`${arrowClass} right-2.5 md:right-[42px]`}
              >
                &#8250;
              </button>
            )}
          </>
        )}
      </section>

    </>
  );
}




const features = [
  {
    icon: ShoppingCart,
    title: "Free Delivery",
    text: "Consectetur adipi elit lorem ipsum dolor sit amet.",
  },
  {
    icon: Trophy,
    title: "Quality Guarantee",
    text: "Dolor sit amet orem ipsu mcons ectetur adipi elit.",
  },
  {
    icon: BadgePercent,
    title: "Daily Offers",
    text: "Amet consectetur adipi elit lorem ipsum dolor sit.",
  },
  {
    icon: MessageCircleCheck,
    title: "100% Secure Payment",
    text: "Rem Lopsum dolor sit amet, consectetur adipi elit.",
  },
];


function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        if (response.data.success) {
          setCategories(response.data.categories ?? []);
        } else {
          setError("Could not fetch categories.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load categories."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
      {/* Features row */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon
              className="mt-0.5 h-5 w-5 shrink-0 text-[#f2694a]"
              strokeWidth={1.75}
            />
            <div>
              <h3 className="text-[13px] font-light uppercase tracking-wider text-gray-700">
                {title}
              </h3>
              <p className="mt-1 max-w-[210px] text-xs font-light leading-snug text-gray-500">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories heading */}
      <div className="mt-24 flex items-center gap-3">
        <h2 className="text-xl font-light uppercase tracking-wide text-gray-700">
          Categories
        </h2>
        <span
          aria-hidden="true"
          className="h-2.5 flex-1 bg-[repeating-linear-gradient(-45deg,#cbd5e1_0,#cbd5e1_1px,transparent_1px,transparent_4px)]"
        />
      </div>

      {/* Category cards */}
      {loading ? (
        <p className="mx-auto p-8">Loading categories...</p>
      ) : error ? (
        <p className="mx-auto p-8 text-red-600">{error}</p>
      ) : categories.length === 0 ? (
        <p className="mx-auto p-8">No categories available.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const rawImage =
              typeof category.image === "string"
                ? category.image
                : category.image?.url;

            const imageSrc = rawImage
              ? rawImage.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] ||
                rawImage.match(/https?:\/\/[^\s)]+/)?.[0] ||
                ""
              : "";

            return (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group flex h-44 flex-col items-center justify-between rounded-md border border-gray-200 bg-white px-3 pb-4 pt-6 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2694a]"
              >
                <div className="relative h-24 w-full">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      alt={category.name || "Category"}
                      fill
                      sizes="(min-width: 1024px) 140px, 33vw"
                      className="object-contain"
                    />
                  )}
                </div>

                <span className="text-sm font-light text-gray-700">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}


 function DiscountedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [i, setI] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        if (response.data.success) {
          const fetchedProducts =
            response.data.products ?? [];

          setProducts(fetchedProducts);
        } else {
          setError("Could not fetch products.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Move to the previous or next product
  const go = (direction) => {
    if (products.length === 0) return;

    setI(
      (current) =>
        (current + direction + products.length) %
        products.length
    );
  };

  // Show only the selected product
  const product = products[i];

  // Support either string image URLs or { url } objects
 const rawImage =
        typeof product?.images?.[0] === "string"
          ? product.images[0]
          : product?.images?.[0]?.url;

      const imageSrc = rawImage
        ? rawImage.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] ||
          rawImage.match(/https?:\/\/[^\s)]+/)?.[0] ||
          ""
        : "";

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label="Featured products"
        className={`${outfit.className} relative flex min-h-[290px] items-center overflow-hidden bg-[#f5f5f5] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`}
      >
        {loading ? (
          <p className="mx-auto p-8">Loading products...</p>
        ) : error ? (
          <p className="mx-auto p-8 text-red-600">
            {error}
          </p>
        ) : !product ? (
          <p className="mx-auto p-8">
            No products available.
          </p>
        ) : (
          <>
            {products.length > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className={`${arrowClass} left-2.5 md:left-[42px]`}
              >
                &#8249;
              </button>
            )}

            <div
              key={product._id}
              className="mx-auto flex min-h-[290px] w-full max-w-[1100px] flex-col items-center justify-between gap-6 px-14 py-8 text-center md:flex-row md:px-[90px] md:py-0 md:text-left"
            >

              
              {/* Product image */}
              <div className="flex justify-center md:basis-[52%] md:shrink-0 md:grow-0">
                <div className="relative aspect-square w-[min(340px,70vw)] rounded-full bg-[#e9e9e9] dark:bg-neutral-700 md:-mb-[60px] md:mt-[60px]">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      alt={product.name || product.title || "Product"}
                      width={420}
                      height={340}
                      priority={i === 0}
                      className="absolute left-1/2 top-1/2 h-auto w-[120%] max-w-none -translate-x-[45%] -translate-y-[62%]"
                    />
                  )}
                </div>
              </div>


              {/* Product text */}
              <div className="md:basis-[38%] md:shrink-0 md:grow-0">
                <h1 className="mb-2.5 text-[clamp(22px,2.8vw,32px)] font-light uppercase tracking-[0.04em]">

                {product.variants[0]?.oldPrice > product.variants[0]?.price &&
                      product.variants[0]?.oldPrice > 0 && (
                        <span>
                          {Math.round(
                            ((product.variants[0].oldPrice -
                              product.variants[0].price) /
                              product.variants[0].oldPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      )} on  { product.name} <br></br>

                    <div className="flex items-center gap-2">
                        {/* Old price */}
                        {product.variants[0]?.oldPrice > product.variants[0]?.price && (
                          <span className="text-xs text-gray-400 line-through">
                            Rs. {product.variants[0].oldPrice}
                          </span>
                        )}

                        {/* Current price */}
                        <span className="text-sm font-medium text-gray-800">
                          Rs. {product.variants[0]?.price}
                        </span>
                      </div>

                </h1>

                <p className="mb-[22px] text-[13px] font-light text-neutral-600 dark:text-neutral-300">
                  {product.text ||
                    product.description ||
                    "Discover our latest collection."}
                </p>

                <a
                  href={`/products/${product.slug}`}
                  className="inline-block rounded-full bg-[#ff6a3d] px-[26px] py-2.5 text-[10px] uppercase tracking-[0.1em] text-white hover:brightness-95"
                >
                  Shop Now
                </a>
              </div>

            </div>

            {products.length > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className={`${arrowClass} right-2.5 md:right-[42px]`}
              >
                &#8250;
              </button>
            )}
          </>
        )}
      </section>

    </>
  );
}








const getRating = (product) =>
  Number(
    product.averageRating ??
      product.rating ??
      product.reviewStats?.averageRating ??
      0
  );

const getVariant = (product, onSale = false) => {
  const variants = product.variants ?? [];

  if (onSale) {
    return (
      variants.find(
        (variant) =>
          Number(variant.oldPrice) > Number(variant.price) &&
          Number(variant.oldPrice) > 0
      ) ?? variants[0]
    );
  }

  return variants[0];
};

const getImage = (product) => {
  const image = product.images?.[0];

  const raw =
    typeof image === "string" ? image : image?.url;

  if (!raw) return "";

  return (
    raw.match(/\]\((https?:\/\/[^)]+)\)/)?.[1] ||
    raw.match(/https?:\/\/[^\s)]+/)?.[0] ||
    ""
  );
};

function ProductRow({ product, onSale = false }) {
  const variant = getVariant(product, onSale);
  const imageSrc = getImage(product);

  return (
    <li className="border border-neutral-100 py-4 first:pt-0 last:border-b-0 last:pb-0 transition-shadow hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="flex items-center gap-3"
      >
        <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded bg-neutral-100">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={product.name || "Product"}
              fill
              sizes="50px"
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[13px] leading-snug text-neutral-800">
            {product.name}
          </p>

          {variant ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
              {Number(variant.oldPrice) > Number(variant.price) &&
                Number(variant.oldPrice) > 0 && (
                  <span className="text-xs text-neutral-400 line-through">
                    Rs. {Number(variant.oldPrice).toLocaleString("en-PK")}
                  </span>
                )}

              <span className="font-medium text-[#f0775a]">
                Rs. {Number(variant.price).toLocaleString("en-PK")}
              </span>

              {Number(variant.oldPrice) > Number(variant.price) &&
                Number(variant.oldPrice) > 0 && (
                  <span className="text-xs text-green-600">
                    {Math.round(
                      ((Number(variant.oldPrice) -
                        Number(variant.price)) /
                        Number(variant.oldPrice)) *
                        100
                    )}
                    % OFF
                  </span>
                )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">
              Price unavailable
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

 function ProductColumns() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        if (response.data.success) {
          setProducts(
            response.data.products ?? response.data.data ?? []
          );
        } else {
          setError("Could not fetch products.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const latestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 3);

  const featuredProducts = products
    .filter((product) => product.isFeatured)
    .slice(0, 3);

  const bestReviewedProducts = [...products]
    .filter((product) => getRating(product) > 0)
    .sort((a, b) => getRating(b) - getRating(a))
    .slice(0, 3);

  const saleProducts = products
    .filter((product) =>
      (product.variants ?? []).some(
        (variant) =>
          Number(variant.oldPrice) > Number(variant.price) &&
          Number(variant.oldPrice) > 0
      )
    )
    .slice(0, 3);

  const columns = [
    { title: "Featured", products: featuredProducts },
    { title: "Latest Items", products: latestProducts },
    { title: "Best Reviewed", products: bestReviewedProducts },
    { title: "On Sale", products: saleProducts, onSale: true },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      {loading ? (
        <p className="py-8 text-center">Loading products...</p>
      ) : error ? (
        <p className="py-8 text-center text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div
              key={column.title}
              className="rounded-lg border border-neutral-200/80 bg-white p-4"
            >
              <h3 className="text-lg font-light uppercase tracking-wide text-neutral-700">
                {column.title}
              </h3>

              <div
                aria-hidden="true"
                className="my-5 h-2 w-full bg-[repeating-linear-gradient(-45deg,#d4d4d4_0,#d4d4d4_1px,transparent_1px,transparent_4px)]"
              />

              {column.products.length > 0 ? (
                <ul>
                  {column.products.map((product) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onSale={column.onSale}
                    />
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-sm text-neutral-500">
                  {column.title === "Best Reviewed"
                    ? "No rated products available."
                    : "No products available."}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}



