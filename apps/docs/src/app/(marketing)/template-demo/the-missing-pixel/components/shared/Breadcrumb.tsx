// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from "next/link";

export type Crumb = { label: string; href?: string };

const MAX_LABEL = 20;

const shorten = (label: string) =>
  label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL).trimEnd()}…` : label;

const Breadcrumb = ({ crumbs }: { crumbs: Crumb[] }) => (
  <nav aria-label="Breadcrumb" className="pt-[1vh] max-lg:pt-[2vh] max-md:pt-[2vh]">
    <ol className="flex flex-wrap items-center gap-2 text-14 text-mpx-muted">
      {crumbs.map((crumb, index) => (
        <li key={crumb.label} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="opacity-50">
              /
            </span>
          )}
          {crumb.href ? (
            <Link href={crumb.href} title={crumb.label} className="transition-colors duration-300 hover:text-(color:--mpx-ink)">
              {shorten(crumb.label)}
            </Link>
          ) : (
            <span aria-current="page" title={crumb.label} className="text-(color:--mpx-ink)">
              {shorten(crumb.label)}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
