"use client";

// app/cart/Cart.jsx  (client component, used by app/cart/page.jsx)
// Reads and writes the "mudaroo-cart" key in localStorage.

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";


const CART_KEY = "mudaroo-cart";
const CURRENCY = "$"; // change to "Rs " etc. if needed
const ACCENT = "text-[#ff6a45]";
const ACCENT_BG = "bg-[#ff6a45] hover:bg-[#f0562f]";

const money = (n) =>
  `${CURRENCY}${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const itemKey = (i) => i.variantId || i.sku || i.productId;

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable or full */
  }
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h3l2.2 11h10.6L20 6H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
      <path d="M11.5 8.5l3 3m0-3l-3 3" />
    </svg>
  );
}

function QtyControl({ value, onChange }) {
  const btn =
    "h-8 w-8 rounded bg-white text-sm shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:bg-gray-50 " +
    "focus:outline-none focus:ring-2 focus:ring-[#ff6a45]";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Decrease quantity" className={btn}
              onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <input
        type="number" min="1" inputMode="numeric" aria-label="Quantity" value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
        className="h-8 w-14 rounded bg-white text-center text-sm shadow-[0_1px_4px_rgba(0,0,0,0.12)]
                   focus:outline-none focus:ring-2 focus:ring-[#ff6a45]
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                   [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" aria-label="Increase quantity" className={btn}
              onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

 function Cart() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false); // avoids hydration mismatch
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  const changeQty = (key, qty) => {
    setItems((list) => list.map((i) => (itemKey(i) === key ? { ...i, quantity: qty } : i)));
    setDirty(true);
  };

  const removeItem = (key) => {
    setItems((list) => {
      const next = list.filter((i) => itemKey(i) !== key);
      writeCart(next); // removing saves immediately
      return next;
    });
  };

  const updateCart = () => {
    writeCart(items);
    setDirty(false);
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal; // add shipping / tax / discounts here later

  const btn =
    `${ACCENT_BG} rounded-full px-6 py-2.5 text-[11px] font-medium uppercase tracking-wider ` +
    "text-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 " +
    "focus:ring-offset-2 focus:ring-[#ff6a45]";

  if (!ready) {
    return <main className="mx-auto max-w-6xl px-4 py-16 text-sm text-gray-500">Loading cart…</main>;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-xl uppercase tracking-wide text-gray-800">Your cart is empty</h1>
        <Link href="/" className={`${btn} mt-6 inline-block`}>Continue shopping</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 text-gray-800">
      {/* Header row (desktop only) */}
      <div className="hidden md:grid grid-cols-12 gap-4 pb-4 text-xs uppercase tracking-widest text-gray-600">
        <div className="col-span-5">Product</div>
        <div className="col-span-3">Quantity</div>
        <div className="col-span-3">Subtotal</div>
        <div className="col-span-1" />
      </div>
      <div className="hidden md:block h-2 opacity-40"
           style={{ backgroundImage: "repeating-linear-gradient(135deg,#999 0 1px,transparent 1px 4px)" }} />

      {/* Items */}
      <ul>
        {items.map((item) => {
          const key = itemKey(item);
          const name = item.title || item.name;
          return (
            <li key={key} className="grid grid-cols-12 items-center gap-x-4 gap-y-4 border-b border-gray-200 py-5">
              {/* Product */}
              <div className="col-span-10 md:col-span-5 flex items-center gap-4">
                <div className="h-20 w-16 sm:h-[84px] sm:w-[67px] shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <Link href={item.slug ? `/products/${item.slug}` : "#"}
                        className="block truncate text-sm hover:underline">
                    {name}
                  </Link>
                  {(item.color || item.size) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  <p className={`mt-1 text-xs ${ACCENT}`}>{money(item.price)}</p>
                </div>
              </div>

              {/* Remove (mobile: top right) */}
              <div className="col-span-2 md:order-last md:col-span-1 flex justify-end">
                <button type="button" onClick={() => removeItem(key)} aria-label={`Remove ${name}`}
                        className="text-gray-900 hover:text-[#ff6a45] focus:outline-none focus:ring-2 focus:ring-[#ff6a45] rounded">
                  <RemoveIcon />
                </button>
              </div>

              {/* Quantity */}
              <div className="col-span-6 md:col-span-3">
                <QtyControl value={item.quantity} onChange={(q) => changeQty(key, q)} />
              </div>

              {/* Subtotal */}
              <div className={`col-span-6 md:col-span-3 text-right md:text-left text-lg ${ACCENT}`}>
                {money(item.price * item.quantity)}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <section className="mt-10">
        <h2 className="text-lg uppercase tracking-wide">Cart totals</h2>
        <dl className="mt-4 border-t border-gray-200 text-sm uppercase tracking-wide">
          <div className="flex items-center justify-between border-b border-gray-200 py-3 sm:justify-start">
            <dt className="w-40 sm:w-48">Subtotal</dt>
            <dd className={ACCENT}>{money(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 py-3 sm:justify-start">
            <dt className="w-40 sm:w-48">Total</dt>
            <dd className={ACCENT}>{money(total)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={updateCart} disabled={!dirty} className={btn}>
            Update cart
          </button>
          <Link href="/shop" className={`${btn} text-center`}>Continue shopping</Link>
          <Link href="/checkout" className={`${btn} text-center`}>Proceed to checkout</Link>
        </div>
        {dirty && (
          <p className="mt-3 text-xs text-gray-500">You have unsaved quantity changes. Click “Update cart” to save.</p>
        )}
      </section>
    </main>
  );
}

export default function CartPage(){
    return(
       <>
    <PageHeader
        title="Cart"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/carts" },
        ]}
      />
      <Cart />
    </>

    )
}

