import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo-metadata";

export const metadata = createPageMetadata({
  title: "Pro | Hyperiux UI",
  description: "Browse all pro component demos",
  path: "/pro",
});

async function getProRoutes(dir = path.join(process.cwd(), "src/app/pro"), prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      routes.push(...(await getProRoutes(fullPath, `${prefix}/${entry.name}`)));
      continue;
    }

    if (entry.isFile() && entry.name === "page.js" && prefix) {
      routes.push(prefix);
    }
  }

  return routes;
}

function formatLabel(route) {
  return route
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(" / ");
}

export default async function ProPage() {
  const routes = (await getProRoutes())
    .filter((route) => !route.endsWith("/page2"))
    .sort((a, b) => a.localeCompare(b));

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 text-4xl font-semibold">Pro components</h1>
        <p className="mb-8 text-sm text-black/70">
          {routes.length} routes found in <code>/pro</code>
        </p>

        <ul className="space-y-5">
          {routes.map((route) => (
            <li
              key={route}
              className="rounded-2xl border border-black/10 px-4 py-3 transition-colors hover:bg-black/3 text-center"
            >
              <Link
                target="_blank"
                href={`/pro${route}`}
                className="flex flex-col gap-1  transition-opacity hover:opacity-70"
              >
                <span className="text-lg font-medium">{formatLabel(route)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
