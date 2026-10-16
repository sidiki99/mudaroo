// 

"use client";

import { useState } from "react";
import Image from "next/image";
import { Outfit } from "next/font/google";
import LatestPosts from "./components/common/LatestPosts"
import BrandMarquee from "./components/common/BrandMarquee"

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400"] });

// Put your product photos (transparent PNGs) in /public and update the paths.
const slides = [
  {
    title: "GoPro Hero9 Black",
    text: "Limited stocks available. Grab it now!",
    cta: "Shop collection",
    href: "/collection",
    image: "/images/camera.jpg",
    alt: "GoPro Hero9 Black camera",
  },
  {
    title: "Hero9 Accessories",
    text: "Mounts, batteries and cases for every ride.",
    cta: "Shop accessories",
    href: "/accessories",
    image: "/images/clothes.jpg",
    alt: "GoPro Hero9 Black camera",
  },
  {
    title: "Action Bundles",
    text: "Camera, mount and memory card in one box.",
    cta: "Shop bundles",
    href: "/bundles",
    image: "/images/camera.jpg",
    alt: "GoPro Hero9 Black camera",
  },
];

const discountSlides = [
  {
    title: "Summer Fashion Sale",
    text: "Upgrade your style with exclusive discounts on the latest fashion.",
    cta: "Shop collection",
    href: "/collection",
    image: "/images/camera.jpg",
    alt: "Summer fashion collection",
  },
  {
    title: "Trendy Clothing Deals",
    text: "Discover stylish outfits at special prices for a limited time.",
    cta: "Shop clothing",
    href: "/accessories",
    image: "/images/clothes.jpg",
    alt: "Trendy clothing collection",
  },
  {
    title: "Exclusive Fashion Bundles",
    text: "Refresh your wardrobe with amazing deals on selected outfits.",
    cta: "Shop bundles",
    href: "/bundles",
    image: "/images/camera.jpg",
    alt: "Exclusive fashion offers",
  },
];

const arrowClass =
  "absolute top-1/2 -mt-[15px] h-[30px] w-6 rounded-[3px] border border-neutral-300 " +
  "text-sm leading-none text-neutral-400 hover:text-neutral-600 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[#ff6a3d] dark:border-neutral-600";

export default function HeroSection() {
  const [i, setI] = useState(0);
  const go = (n) => setI((n + slides.length) % slides.length);
  const s = slides[i];

  return (
   <> 
    <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      className={`${outfit.className} relative flex min-h-[290px] items-center overflow-hidden bg-[#f5f5f5] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`}
    >
      <button
        onClick={() => go(i - 1)}
        aria-label="Previous slide"
        className={`${arrowClass} left-2.5 md:left-[42px]`}
      >
        &#8249;
      </button>

      <div
        key={i}
        className="mx-auto flex min-h-[290px] w-full max-w-[1100px] flex-col items-center justify-between gap-6 px-14 py-8 text-center md:flex-row md:px-[90px] md:py-0 md:text-left"
      >
        {/* Text */}
        <div className="md:basis-[38%] md:shrink-0 md:grow-0">
          <h1 className="mb-2.5 text-[clamp(22px,2.8vw,32px)] font-light uppercase tracking-[0.04em]">
            {s.title}
          </h1>
          <p className="mb-[22px] text-[13px] font-light text-neutral-600 dark:text-neutral-300">
            {s.text}
          </p>
          <a
            href={s.href}
            className="inline-block rounded-full bg-[#ff6a3d] px-[26px] py-2.5 text-[10px] uppercase tracking-[0.1em] text-white hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a3d]"
          >
            {s.cta}
          </a>
        </div>

        {/* Image on circle */}
        <div className="flex justify-center md:basis-[52%] md:shrink-0 md:grow-0">
          <div className="relative aspect-square w-[min(340px,70vw)] rounded-full bg-[#e9e9e9] dark:bg-neutral-700 md:-mb-[60px] md:mt-[60px]">
            <Image
              src={s.image}
              alt={s.alt}
              width={420}
              height={340}
              priority
              className="absolute left-1/2 top-1/2 h-auto w-[120%] max-w-none -translate-x-[45%] -translate-y-[62%]"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => go(i + 1)}
        aria-label="Next slide"
        className={`${arrowClass} right-2.5 md:right-[42px]`}
      >
        &#8250;
      </button>
     
    </section>
     <CategoriesSection />    
     <BestSellingCarousel />
     <DiscountSection />
     <ProductColumns />
     <LatestPosts />
     <BrandMarquee /> 
     
     </>
  );
}

// components/CategoriesSection.jsx
// Requires:  npm i lucide-react
// Font:      Outfit (see layout.jsx note at the bottom of this file)
// Images:    put your product images in /public/images/ (phones.png, playstation.png, ...)


import Link from "next/link";
import { ShoppingCart, Trophy, BadgePercent, MessageCircleCheck } from "lucide-react";
import BestSellingCarousel from "./components/home-components/BestSeller";

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

const categories = [
  { name: "Shoes", image: "/images/cat1.jpg", href: "/category/phones" },
  { name: "Electronics Devices", image: "/images/cat2.jpg", href: "/category/playstations" },
  { name: "Clothes", image: "/images/clothes.jpg", href: "/category/digital-watches" },
  { name: "PlayStations", image: "/images/cat3.jpg", href: "/category/joysticks" },
  { name: "Watches", image: "/images/cat4.jpg", href: "/category/earpods" },
  { name: "Shoes", image: "/images/cat1.jpg", href: "/category/phones" },

 
];

 function CategoriesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
      {/* ---------- Features row ---------- */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#f2694a]" strokeWidth={1.75} />
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

      {/* ---------- Categories heading with hatched line ---------- */}
      <div className="mt-24 flex items-center gap-3">
        <h2 className="text-xl font-light uppercase tracking-wide text-gray-700">
          Categories
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

function  DiscountSection(){
  const [i, setI] = useState(0);
  const go = (n) => setI((n + discountSlides.length) % discountSlides.length);
  const s = discountSlides[i];
  return(
      <section
      aria-roledescription="carousel"
      aria-label="Featured products"
      className={`${outfit.className} relative flex min-h-[290px] items-center overflow-hidden bg-[#f5f5f5] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`}
    >
      <button
        onClick={() => go(i - 1)}
        aria-label="Previous slide"
        className={`${arrowClass} left-2.5 md:left-[42px]`}
      >
        &#8249;
      </button>

      <div
        key={i}
        className="mx-auto flex min-h-[290px] w-full max-w-[1100px] flex-col items-center justify-between gap-6 px-14 py-8 text-center md:flex-row md:px-[90px] md:py-0 md:text-left"
      >
         {/* Image on circle */}
        <div className="flex justify-center md:basis-[52%] md:shrink-0 md:grow-0">
          <div className="relative aspect-square w-[min(340px,70vw)] rounded-full bg-[#e9e9e9] dark:bg-neutral-700 md:-mb-[60px] md:mt-[60px]">
            <Image
              src={s.image}
              alt={s.alt}
              width={420}
              height={340}
              priority
              className="absolute left-1/2 top-1/2 h-auto w-[120%] max-w-none -translate-x-[45%] -translate-y-[62%]"
            />
          </div>
        </div>

        {/* Text */}
        <div className="md:basis-[38%] md:shrink-0 md:grow-0">
          <h1 className="mb-2.5 text-[clamp(22px,2.8vw,32px)] font-light uppercase tracking-[0.04em]">
           30 % Discount on  {s.title}
          </h1>
          <p className="mb-[22px] text-[13px] font-light text-neutral-600 dark:text-neutral-300">
            {s.text}
          </p>
          <a
            href={s.href}
            className="inline-block rounded-full bg-[#ff6a3d] px-[26px] py-2.5 text-[10px] uppercase tracking-[0.1em] text-white hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a3d]"
          >
            {s.cta}
          </a>
        </div>

       
      </div>

      <button
        onClick={() => go(i + 1)}
        aria-label="Next slide"
        className={`${arrowClass} right-2.5 md:right-[42px]`}
      >
        &#8250;
      </button>
     
    </section>
  )
}




const columns = [
  {
    title: "Featured",
    products: [
      { name: "Wireless Headset", price: 500,image: "/images/cat3.jpg" },
      { name: "Iphone X Pro Max", price: 820, image: "/products/iphone-x.jpg" },
      { name: "Iphone 11 Pro", price: 960, image: "/products/iphone-11.jpg" },
    ],
  },
  {
    title: "Latest Items",
    products: [
      { name: "Apple AirPod", price: 450, image: "/images/cat3.jpg" },
      { name: "Screen Touch Watch", price: 750, image: "/products/watch.jpg" },
      { name: "Digital Watch", price: 660, image: "/products/digital-watch.jpg" },
    ],
  },
  {
    title: "Best Reviewed",
    products: [
      { name: "Wireless Joysticks", price: 350, image: "/products/joystick.jpg" },
      { name: "Apple White AirPod", price: 330, image: "/products/airpod-white.jpg" },
      { name: "Gimbal Stabilizer", price: 920, image: "/products/gimbal.jpg" },
    ],
  },
  {
    title: "On Sale",
    products: [
      { name: "Iphone 15 Pro Max", price: 999, oldPrice: 1666, image: "/products/iphone-15.jpg" },
      { name: "White AirPods", price: 410, oldPrice: 500, image: "/products/airpods-white.jpg" },
      { name: "Security CCTV Camera", price: 500, oldPrice: 600, image: "/products/cctv.jpg" },
    ],
  },
];

function ProductRow({ product }) {
  return (
    <li className="flex items-center gap-3 border border-neutral-100 py-4 first:pt-0 last:border-b-0 last:pb-0 transition-shadow hover:shadow-lg cursor-pointer ">
      <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="50px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <p className="text-[13px] leading-snug text-neutral-800">{product.name}</p>
        <p className="mt-1 text-[13px] text-[#f0775a]">
          {product.oldPrice && (
            <span className="mr-1.5 text-neutral-400 line-through">
              ${product.oldPrice}
            </span>
          )}
          ${product.price}
        </p>
      </div>
    </li>
  );
}

 function ProductColumns() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.title}
            className="rounded-lg border border-neutral-200/80 bg-white p-4"
          >
            <h3 className="text-lg font-light uppercase tracking-wide text-neutral-700">
              {column.title}
            </h3>

            {/* hatched divider */}
            <div
              aria-hidden
              className="my-5 h-2 w-full bg-[repeating-linear-gradient(-45deg,#d4d4d4_0,#d4d4d4_1px,transparent_1px,transparent_4px)]"
            />

            <ul>
              {column.products.map((product) => (
                <ProductRow key={product.name} product={product} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}






