

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const baseLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!cancelled) {
          setUser(
            response.ok && result.success
              ? result.data
              : null
          );
        }
      } catch (error) {
        console.error("Unable to check current user:", error);

        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const pageLinks = [
    { label: "Checkout", href: "/checkout" },
    { label: "Admin", href: "/admin/dashboard" },

    ...(checkingAuth
      ? []
      : user
        ? [{ label: "My Account", href: "/profile" },
          
        ]
        : [
            { label: "Login", href: "/login" },
            { label: "Signup", href: "/signup" },
          ]),
  ];

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Check your logout API.");
      }

      setUser(null);
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message || "Unable to log out.");
    } finally {
      setLoggingOut(false);
    }
  }

  function closeMenu() {
    setOpen(false);
  }

  function renderPageLinks(mobile = false) {
    return (
      <>
        {pageLinks.map((child) => (
          <li key={child.label}>
            <Link
              href={child.href}
              onClick={mobile ? closeMenu : undefined}
              className={
                mobile
                  ? "block py-2 text-xs uppercase tracking-wider text-gray-500 hover:text-[#f0583b]"
                  : "block px-5 py-2.5 text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-[#f0583b]"
              }
            >
              {child.label}
            </Link>
          </li>
        ))}

        {!checkingAuth && user && (
          <li>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={
                mobile
                  ? "block py-2 text-xs uppercase tracking-wider text-gray-500 hover:text-[#f0583b]"
                  : "block w-full px-5 py-2.5 text-left text-xs uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-[#f0583b]"
              }
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </li>
        )}
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-[22px] tracking-[3px] text-gray-800"
        >
          <span className="font-semibold text-gray-800">MU</span>
            <span className="font-light text-gray-500">DAR</span>
            <span className="font-semibold text-gray-800">OO</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {baseLinks.slice(0, 3).map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`flex items-center py-[26px] text-xs uppercase tracking-[1.5px] transition-colors hover:text-[#f0583b] ${
                    pathname === link.href
                      ? "text-[#f0583b]"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="group relative">
              <Link
                href="#"
                onClick={(event) => event.preventDefault()}
                className="flex items-center gap-1 py-[26px] text-xs uppercase tracking-[1.5px] text-gray-700 hover:text-[#f0583b]"
              >
                Pages
                <ChevronDown size={12} />
              </Link>

              <ul className="invisible absolute left-0 top-full z-50 min-w-[160px] border border-gray-200 bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {renderPageLinks()}
              </ul>
            </li>

            <li>
              <Link
                href="/contact"
                className={`flex items-center py-[26px] text-xs uppercase tracking-[1.5px] hover:text-[#f0583b] ${
                  pathname === "/contact"
                    ? "text-[#f0583b]"
                    : "text-gray-700"
                }`}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5 text-gray-700">
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            title={user ? "My Account" : "Login"}
            className="hover:text-[#f0583b]"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hover:text-[#f0583b]"
          >
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <Link
            href="/carts"
            aria-label="Cart"
            className="hover:text-[#f0583b]"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="hover:text-[#f0583b] lg:hidden"
            onClick={() => setOpen((previous) => !previous)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav className="border-t border-gray-200 bg-white lg:hidden">
          <ul className="flex flex-col px-6 py-2">
            {baseLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={`block py-3 text-xs uppercase tracking-[1.5px] ${
                    pathname === link.href
                      ? "text-[#f0583b]"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <span className="flex items-center gap-1 py-3 text-xs uppercase tracking-[1.5px] text-gray-700">
                Pages <ChevronDown size={12} />
              </span>

              <ul className="pb-2 pl-4">
                {renderPageLinks(true)}
              </ul>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
