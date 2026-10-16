import Link from "next/link";
import ShopPage from "../components/shop-component/ShopPage";
import LatestPosts from "../components/common/LatestPosts";
import BrandMarquee from "../components/common/BrandMarquee";
import PageHeader from "../components/common/PageHeader";



// Save as: app/shop/page.jsx   (App Router)
// Components expected in: components/  (ShopPage.jsx + shopData.js together)


// import ShopPage from "@/components/shop-component/ShopPage";


export const metadata = {
  title: "Shop",
};

export default function Shop() {
  return (
    <main>
      <PageHeader
        title="Shop"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
        ]}
      />
      <ShopPage />
      <LatestPosts />
      <BrandMarquee />
      
    </main>
  );
}