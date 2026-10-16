
import Link from "next/link";
import PageHeader from "../components/common/PageHeader";
import { ShoppingCart, Trophy, BadgePercent, MessageCircleCheck } from "lucide-react";
import VideoFeature from "../components/about-component/VideoFeature";
import LatestPosts from "../components/common/LatestPosts";
import BrandMarquee from "../components/common/BrandMarquee";

export const metadata = {
  title: "About us",
};

export default function AboutUs(){
    return(
      <> 
        <PageHeader
        title="About Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about-us" },
          ]}
        />
        <Features />
        <VideoFeature />
        <LatestPosts />
        <BrandMarquee />

      </>
     )
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

function Features(){
   return(
     <section className="mx-auto w-full max-w-6xl px-6 py-10 font-sans text-gray-700">
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
    </section>
   )

}
