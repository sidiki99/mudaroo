"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Blogs", href: "/blogs" },
  {
    label: "Pages",
    href: "#",
    children: [
      { label: "Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
      { label: "Login", href: "/login" },
      { label: "Signup", href: "/signup" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-[22px] tracking-[3px] text-gray-800">
          <span className="font-bold">SHOP</span>
          <span className="font-light">LITE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {links.map((link) => (
              <li key={link.label} className="group relative">
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 py-[26px] text-xs uppercase tracking-[1.5px] transition-colors hover:text-[#f0583b] ${
                    pathname === link.href ? "text-[#f0583b]" : "text-gray-700"
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown size={12} />}
                </Link>

                {link.children && (
                  <ul className="invisible absolute left-0 top-full min-w-[160px] border border-gray-200 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          className="block px-5 py-2.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-[#f0583b]"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5 text-gray-700">
          <button aria-label="Search" className="hover:text-[#f0583b]">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/login" aria-label="Account" className="hover:text-[#f0583b]">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <button aria-label="Wishlist" className="hover:text-[#f0583b]">
            <Heart size={20} strokeWidth={1.5} />
          </button>
          <Link href="/cart" aria-label="Cart" className="hover:text-[#f0583b]">
            <ShoppingCart size={20} strokeWidth={1.5} />
          </Link>

          {/* Mobile toggle */}
          <button
            aria-label="Menu"
            className="lg:hidden hover:text-[#f0583b]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-gray-200 bg-white lg:hidden">
          <ul className="flex flex-col px-6 py-2">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => !link.children && setOpen(false)}
                  className={`block py-3 text-xs uppercase tracking-[1.5px] ${
                    pathname === link.href ? "text-[#f0583b]" : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <ul className="pb-2 pl-4">
                    {link.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-xs uppercase tracking-wider text-gray-500 hover:text-[#f0583b]"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}