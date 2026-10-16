// Base items. They are repeated below to produce 55 demo products.
// Replace this whole file with a fetch from your API / database later.
const baseProducts = [
  { name: "iPad (9th Gen)", price: 870, category: "Tablets", brand: "Apple", tags: ["White", "Modern"], image: "/products/ipad.jpg" },
  { name: "Drone With Camera", price: 600, category: "Accessories", brand: "Samsung", tags: ["White", "Modern"], image: "/products/drone.jpg" },
  { name: "Apple Watch (2nd Gen)", price: 400, category: "Watches", brand: "Apple", tags: ["Mobile", "Modern"], image: "/products/apple-watch.jpg" },
  { name: "Ultra HD TV", price: 2000, category: "Accessories", brand: "Samsung", tags: ["Modern"], image: "/products/tv.jpg" },
  { name: "Wireless Headphones", price: 300, category: "Accessories", brand: "Green", tags: ["White", "Mobile"], image: "/products/headphones.jpg" },
  { name: "Smart Speaker", price: 320, category: "Accessories", brand: "Apple", tags: ["Modern"], image: "/products/smart-speaker.jpg" },
  { name: "Studio Speaker", price: 480, category: "Accessories", brand: "Samsung", tags: ["White"], image: "/products/studio-speaker.jpg" },
  { name: "Bluetooth Speaker", price: 75, category: "Accessories", brand: "Green", tags: ["Cheap", "White", "Mobile"], image: "/products/bluetooth-speaker.jpg" },
  { name: "AirPods", price: 210, category: "Accessories", brand: "Apple", tags: ["White", "Mobile"], image: "/products/airpods.jpg" },
  { name: "MacBook Pro", price: 1800, category: "Laptops", brand: "Apple", tags: ["Modern"], image: "/products/macbook.jpg" },
  { name: "iPhone 11 Pro", price: 960, category: "Phones", brand: "Apple", tags: ["Mobile", "Modern"], image: "/products/iphone.jpg" },
  { name: "Fitness Watch", price: 90, category: "Watches", brand: "Green", tags: ["Cheap", "Mobile"], image: "/products/fitness-watch.jpg" },
];

export const products = Array.from({ length: 55 }, (_, i) => {
  const base = baseProducts[i % baseProducts.length];
  const round = Math.floor(i / baseProducts.length);
  return {
    ...base,
    id: i + 1,
    price: base.price + round * 10, // small variation so sorting looks real
  };
});

export const categories = ["All", "Phones", "Accessories", "Tablets", "Watches", "Laptops"];

export const tags = ["White", "Cheap", "Mobile", "Modern"];

export const brands = ["Apple", "Samsung", "Green"];

// min is inclusive, max is exclusive. Use Infinity for "no upper limit".
export const priceRanges = [
  { label: "Less than $100", min: 0, max: 100 },
  { label: "$100 – $500", min: 100, max: 500 },
  { label: "$500 – $1000", min: 500, max: 1000 },
  { label: "$1000 – $2000", min: 1000, max: 2000 },
  { label: "$2000 & above", min: 2000, max: Infinity },
];

export const sortOptions = [
  { value: "default", label: "Default sorting" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
];