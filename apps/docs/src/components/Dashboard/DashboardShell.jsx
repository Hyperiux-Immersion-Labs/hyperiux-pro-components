"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "../WebsiteComps/Button";
import { useAdminRole } from "@/lib/useAdminRole";
import ButtonV3 from "@/homepage-v3/components/ButtonV3";

const BASE_TABS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Saved Effects", href: "/dashboard/saved" },
  { label: "Usage", href: "/dashboard/usage" },
  { label: "Invoicing", href: "/dashboard/invoicing" },
  { label: "Settings", href: "/dashboard/settings" },
];

// Admin-only, gated by dashboard/admin/layout.js's requireAdmin() check
// regardless of this tab list - hiding them here is a nav nicety, not the
// actual access control.
const ADMIN_TABS = [
  { label: "User Management", href: "/dashboard/admin" },
  { label: "Activity", href: "/dashboard/admin/activity" },
];

// Payment detail across every user is a step up from what a regular admin
// can already see - restricted to super admins both here and (the real
// gate) in api/admin/invoices/route.js's assertSuperAdmin() check.
const SUPER_ADMIN_TABS = [{ label: "Invoicing", href: "/dashboard/admin/invoicing" }];

// Invoicing is a customer-account concept (personal billing) - an admin has
// none, so surfacing it would just show empty/irrelevant state instead of
// being hidden outright. Usage isn't hidden: admins can still copy/install
// effects (just without a daily limit), and the main dashboard's Copied/
// Installed Effects tiles link here for every account, admins included.
const ADMIN_HIDDEN_TABS = new Set(["/dashboard/invoicing"]);

export function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isSuperAdmin } = useAdminRole();

  const visibleBaseTabs = isAdmin
    ? BASE_TABS.filter((tab) => !ADMIN_HIDDEN_TABS.has(tab.href))
    : BASE_TABS;
  const tabs = isAdmin
    ? [...visibleBaseTabs, ...ADMIN_TABS, ...(isSuperAdmin ? SUPER_ADMIN_TABS : [])]
    : visibleBaseTabs;

  // Longest-matching href wins, so a nested route (e.g. /dashboard/admin/activity)
  // lights up only its own tab instead of also lighting up an ancestor tab
  // whose href is a strict prefix of it (e.g. /dashboard/admin, User Management).
  const activeTabHref = tabs
    .filter((tab) =>
      tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-[1600px] mx-auto px-[3vw] pt-20 pb-16 max-md:px-[7vw] max-md:pt-12">

        <div className="mb-12">
          <div className="flex flex-col justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-12 w-12 items-center justify-center border border-white/40 text-white/70 transition hover:bg-[#ff5f00] hover:border-[#ff5f00] hover:text-black cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h1 className="text-7xl font-display">
              Dashboard
            </h1>
          </div>

          <p className="text-white pl-1">
            Manage your Hyperiux Vault account.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 mb-12 max-[1025px]:flex-col">
          <div className="flex gap-3 overflow-x-auto max-w-full pb-3 max-md:pb-[4vw] max-md:flex-wrap">
            {tabs.map((tab) => {
              const active = tab.href === activeTabHref;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    px-7 py-3 max-md:py-[2vw]
                    transition-all duration-300
                    border shrink-0
                    ${active
                      ? "bg-[#ff5f00] text-black border-[#ff5f00]"
                      : "bg-[#272727] text-white border-white/0 hover:bg-[#ff5f00] hover:text-black"}
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <ButtonV3
            href="/effects"
            text={"Browse Effects"}
          />

        </div>

        {children}
      </div>
    </div>
  );
}
