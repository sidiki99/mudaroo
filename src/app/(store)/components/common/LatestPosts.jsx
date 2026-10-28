import { Image, Link } from "lucide-react";

const posts = [
  {
    category: "Gadgets",
    title: "5 Must-Have Gadgets for the Modern Home",
    excerpt:
      "Dive into the world of computing technology with our latest blog post, where we highlight five essential gadgets that every modern home needs.",
    image: "/images/cat3.jpg",
    href: "/blog/must-have-gadgets",
  },
  {
    category: "Phones",
    title: "Eco-Friendly Innovations Making a Difference",
    excerpt:
      "Explore the intersection of technology and sustainability in our latest blog post. Learn about the innovative eco-friendly features in new phones.",
    image: "/posts/phones.jpg",
    href: "/blog/eco-friendly-innovations",
  },
  {
    category: "Tech",
    title: "The Future of Wearable Tech: Trends to Watch",
    excerpt:
      "Stay ahead of the curve with our insightful look into the rapidly evolving landscape of wearable technology. Explore what is coming next.",
    image: "/posts/tech.jpg",
    href: "/blog/future-of-wearable-tech",
  },
  {
    category: "Digital Watch",
    title: "Top Apps and Tools for Remote Work",
    excerpt:
      "In today's remote work environment, productivity is key. Discover the top apps and tools that can help you stay organized and focused.",
    image: "/images/cat4.jpg",
    href: "/blog/apps-and-tools-for-remote-work",
  },
];


export default  function LatestPosts() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* heading with hatched line */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="shrink-0 text-xl font-light uppercase tracking-wide text-neutral-700">
          Latest Posts
        </h2>
        <div
          aria-hidden
          className="h-2 flex-1 bg-[repeating-linear-gradient(-45deg,#d4d4d4_0,#d4d4d4_1px,transparent_1px,transparent_4px)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <article key={post.title}>
            <Link href={post.href} className="relative block">
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <span className="absolute left-0 top-0 bg-[#ff5a36] px-2 py-1 text-xs font-medium uppercase leading-none text-white">
                {post.category}
              </span>
            </Link>

            <h3 className="mt-4 text-[15px] font-light uppercase leading-snug tracking-wide text-neutral-700">
              <Link href={post.href}>{post.title}</Link>
            </h3>

            <p className="mt-1 line-clamp-3 text-sm leading-snug text-neutral-600">
              {post.excerpt}
            </p>

            <Link
              href={post.href}
              className="mt-2 inline-block text-sm text-neutral-700 underline underline-offset-2 hover:text-[#ff5a36]"
            >
              Read More
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
