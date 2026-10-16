
"use client";

import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@mantine/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  {
    id: 1,
    name: "Shoes",
    image: "/images/cat1.jpg",
    price: 2500,
    href: "/category/phones",
  },
  {
    id: 2,
    name: "Electronics Devices",
    image: "/images/cat3.jpg",
    price: 15000,
    href: "/category/playstations",
  },
  {
    id: 3,
    name: "Clothes",
    image: "/images/clothes.jpg",
    price: 3500,
    href: "/category/digital-watches",
  },
  {
    id: 4,
    name: "PlayStations",
    image: "/images/cat3.jpg",
    price: 85000,
    href: "/category/joysticks",
  },
  {
    id: 5,
    name: "Watches",
    image: "/images/cat4.jpg",
    price: 4500,
    href: "/category/earpods",
  },
  {
    id: 6,
    name: "Shoes",
    image: "/images/cat1.jpg",
    price: 3000,
    href: "/category/phones",
  },
];

export default function BestSellingCarousel() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
      {/* Heading */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-light uppercase tracking-wide text-gray-700">
          Best Selling Items
        </h2>

        <span
          aria-hidden="true"
          className="h-2.5 flex-1 bg-[repeating-linear-gradient(-45deg,#cbd5e1_0,#cbd5e1_1px,transparent_1px,transparent_4px)]"
        />
      </div>

      {/* Carousel */}
      <Carousel
        className="mt-6 px-10"
        slideSize={{ base: "50%", sm: "33.3333%", md: "20%" }}
        slideGap="md"
        emblaOptions={{
          align: "start",
          slidesToScroll: 1,
        }}
        controlsOffset={0}
        controlSize={28}
        nextControlIcon={<ChevronRight size={16} />}
        previousControlIcon={<ChevronLeft size={16} />}
        classNames={{
          control:
            "!rounded !border !border-gray-200 !bg-white !text-gray-400 !shadow-none hover:!text-[#f2694a] data-[inactive]:!opacity-0",
        }}
      >
        {items.map((item) => (
          <Carousel.Slide key={item.id}>
            <Link
              href={item.href}
              className="flex h-52 flex-col items-center justify-between rounded-md border border-gray-200 bg-white px-3 pb-4 pt-6 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2694a]"
            >
              {/* Product image */}
              <div className="relative h-28 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 160px, 40vw"
                  className="object-contain"
                />
              </div>

              {/* Product details */}
              <div className="text-center">
                <p className="text-xs font-light text-gray-700">
                  {item.name}
                </p>

                <p className="mt-1 text-xs font-light text-[#f2694a]">
                  Rs. {item.price.toLocaleString("en-PK")}
                </p>
              </div>
            </Link>
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
}
