// components/Footer.jsx
// Install:  npm i lucide-react   (or use react-icons if you prefer brand icons)
// Font:     Outfit (same setup as the other sections)

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  // FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about-us" },
  { label: "Shop", href: "/shop" },
  
  { label: "Contact", href: "/contact" },
];

const helpLinks = [
  { label: "Track your order", href: "/track-order" },
  { label: "Returns policies", href: "/returns" },
  { label: "Shipping + Delivery", href: "/shipping" },
  { label: "Contact us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
];

const socials = [
  { icon:  FaFacebookF, href: "#", label: "Facebook", active: true },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  // { icon: FaLinkedIn, href: "#", label: "LinkedIn" },
  { icon:  FaYoutube, href: "https://www.youtube.com", label: "YouTubeIcon" },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-base font-light uppercase tracking-wide text-gray-700">
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[11px] font-normal uppercase tracking-[0.12em] text-gray-700 transition-colors hover:text-[#f2694a]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white font-sans text-gray-700">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
        {/* Brand */}
        <div>
          <Link href="/" className="text-2xl tracking-wide">
            <span className="font-semibold text-gray-800">MU</span>
            <span className="font-light text-gray-500">DAR</span>
            <span className="font-semibold text-gray-800">OO</span>
          </Link>
          <p className="mt-3 max-w-[220px] text-[13px] font-light leading-snug">
            Nisi, purus vitae, ultrices nunc. Sit ac sit suscipit hendrerit.
            Gravida massa volutpat aenean odio erat nullam fringilla.
          </p>

          <div className="mt-3 flex items-center gap-4">
            {socials.map(({ icon: Icon, href, label, active }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`transition-colors hover:text-[#f2694a] ${
                  active ? "text-[#f2694a]" : "text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        <LinkColumn title="Quick Links" links={quickLinks} />
        <LinkColumn title="Help & Info" links={helpLinks} />

        {/* Contact */}
        <div>
          <h4 className="text-base font-light uppercase tracking-wide text-gray-700">
            Contact Us
          </h4>
          <p className="mt-2 max-w-[170px] text-[13px] font-light leading-snug">
            Do you have any queries or suggestions?
          </p>
          <a
            href="mailto:yourinfo@gmail.com"
            className="text-[13px] font-light underline underline-offset-2 hover:text-[#f2694a]"
          >
            msidiki075@gmail.com
          </a>

          <p className="mt-3 max-w-[170px] text-[13px] font-light leading-snug">
            If you need support? Just give us a call.
          </p>
          <a
            href="tel:+551112223344"
            className="text-[13px] font-light underline underline-offset-2 hover:text-[#f2694a]"
          >
            +92 327 73 79 390
          </a>
        </div>
      </div>
    </footer>
  );
}

/* Usage in app/layout.jsx or app/page.jsx:
   import Footer from "@/components/Footer";
   ...
   <Footer />
*/