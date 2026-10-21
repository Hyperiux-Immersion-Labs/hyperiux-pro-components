// Built using Hyperiux Vault: https://vault.hyperiux.com

import Link from "next/link";

export type Crumb = { label: string; href?: string };

const Breadcrumb = ({ crumbs }: { crumbs: Crumb[] }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-2 text-14 text-mpx-muted">
      {crumbs.map((crumb, index) => (
        <li key={crumb.label} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="opacity-50">
              /
            </span>
          )}
          {crumb.href ? (
            <Link href={crumb.href} className="transition-colors duration-300 hover:text-[#0a0a0a]">
              {crumb.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-[#0a0a0a]">
              {crumb.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
