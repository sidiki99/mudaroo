"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  FolderOpen,
  ClipboardList,
  Users,
  Award,
  Settings,
} from "lucide-react";

const links = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reviews", href: "/reviews", icon: Award },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 min-h-screen bg-slate-50 border-r border-slate-200 px-4 py-6">
      {/* Logo */}
      <div className="px-3 mb-8 leading-none">
        {/* <h1 className="text-lg font-extrabold tracking-wide text-slate-800">
          SHOPLITE
        </h1> */}

        <p className="text-[22px] tracking-[3px] text-gray-800">
                  <span className="font-bold">SHOP</span>
                  <span className="font-light">LITE</span>
                </p>

        <span className="text-[11px] font-semibold tracking-[0.35em] text-orange-500">
          ADMIN
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {links.map(({ name, href, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-100/70 text-orange-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}