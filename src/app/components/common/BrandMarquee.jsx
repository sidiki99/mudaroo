
const brands = [
  {
    name: "Techlight",
    node: (
      <span className="text-[17px] uppercase tracking-wide">
        <span className="font-medium">Tech</span>
        <span className="font-light">Light</span>
      </span>
    ),
  },
  {
    name: "MiniStore",
    node: <span className="text-[22px] font-light tracking-tight">MiniStore.</span>,
  },
  {
    name: "Ultras",
    node: (
      <span className="text-xl font-extrabold uppercase tracking-wider">Ultras</span>
    ),
  },
  {
    name: "Swanky",
    node: (
      <span className="text-[15px] font-semibold uppercase tracking-[0.2em]">
        Swanky
      </span>
    ),
  },
  {
    name: "Emily",
    node: (
      <span className="font-serif text-[17px] font-light uppercase tracking-widest">
        Emily
      </span>
    ),
  },
];

  function BrandList({ hidden = false }) {
  return (
    <ul
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-20 pr-20 text-neutral-300"
    >
      {brands.map((brand) => (
        <li key={brand.name} className="shrink-0 whitespace-nowrap">
          {brand.node}
        </li>
      ))}
    </ul>
  );
}

 export default function BrandMarquee() {
  return (
    <section
      aria-label="Our brands"
      className="group w-full overflow-hidden border-y border-neutral-100 bg-white py-10"
    >
      <style>{`
        @keyframes brand-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-marquee-track { animation: none !important; }
        }
      `}</style>

      {/* Two identical lists side by side; moving -50% loops seamlessly */}
      <div className="brand-marquee-track flex w-max animate-[brand-marquee_25s_linear_infinite] group-hover:[animation-play-state:paused]">
        <BrandList />
        <BrandList hidden />
        {/* extra copies keep the strip filled on very wide screens */}
        <BrandList hidden />
        <BrandList hidden />
      </div>
    </section>
  );
}