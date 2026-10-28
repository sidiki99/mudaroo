"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { Heart, Trash2 } from "lucide-react";
import { removeFromWishlist } from "@/app/store/wishlistSlice";

export default function WishlistPage() {
  const dispatch = useDispatch();

  const items = useSelector(
    (state) => state.wishlist.items
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <Heart className="mx-auto mb-4" size={48} />

        <h1 className="mb-3 text-3xl font-semibold">
          My Wishlist
        </h1>

        <p className="mb-6 text-gray-500">
          You haven't saved any products yet.
        </p>

        <Link
          href="/shop"
          className="inline-block bg-[#E8502F] px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold">
        My Wishlist ({items.length})
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <div
            key={product._id}
            className="overflow-hidden rounded-lg border"
          >
            <Link href={`/product/${product.slug}`}>
              <img
                src={
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  product.image ||
                  "/placeholder.png"
                }
                alt={product.name || product.title || "Product"}
                className="h-64 w-full object-cover"
              />
            </Link>

            <div className="p-4">
              <h2 className="font-medium">
                {product.name || product.title}
              </h2>

              <p className="mt-2 font-semibold">
                Rs. {product.price}
              </p>

              <button
                onClick={() =>
                  dispatch(removeFromWishlist(product._id))
                }
                className="mt-4 flex items-center gap-2 text-sm text-red-600"
              >
                <Trash2 size={16} />
                Remove
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="mt-3 block border px-4 py-2 text-center text-sm"
              >
                View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}