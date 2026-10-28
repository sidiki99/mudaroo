
import Link from "next/link";

export default function PageHeader({
  title = "About us",
  breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about-us" },
  ],
}) {
  return (
    <section className="w-full bg-neutral-100 px-4 py-14 text-center">
      <h1 className="text-4xl font-light uppercase tracking-wide text-neutral-800">
        {title}
      </h1>

      <nav aria-label="Breadcrumb" className="mt-2">
        <ol className="flex items-center justify-center gap-2 text-xs text-neutral-700">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={`${crumb.href}-${index}`} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">&gt;</span>}

                <Link
                  href={crumb.href}
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast
                      ? "underline underline-offset-2"
                      : "hover:underline underline-offset-2"
                  }
                >
                  {crumb.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}
