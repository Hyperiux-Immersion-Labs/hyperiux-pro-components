"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Button from "../WebsiteComps/Button";

const BASE_TABS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Saved Effects", href: "/dashboard/saved" },
  { label: "Settings", href: "/dashboard/settings" },
];

const ADMIN_TAB = { label: "Admin", href: "/dashboard/admin" };

export function DashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const tabs = isAdmin ? [...BASE_TABS, ADMIN_TAB] : BASE_TABS;

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-[1600px] mx-auto px-[3vw] pt-20 pb-16 max-md:px-[7vw] max-md:pt-12">

        <div className="mb-12">
          <div className="flex flex-col justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white/70 transition hover:bg-[#ff5f00] hover:border-[#ff5f00] hover:text-white cursor-pointer"
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

        <div className="flex items-center justify-between gap-4 mb-12 max-[1025px]:flex-col max-[1025px]:items-start">
          <div className="flex gap-3 overflow-x-auto max-w-full max-md:pb-[4vw] max-md:flex-wrap">
            {tabs.map((tab) => {
              const active =
                tab.href === "/dashboard"
                  ? pathname === tab.href
                  : pathname.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    px-7 py-[.8vw] max-md:py-[2vw] rounded-full
                    transition-all duration-300
                    border shrink-0
                    ${active
                      ? "bg-white text-black border-white"
                      : "bg-[#272727] text-white border-white/0 hover:bg-white hover:text-black"}
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <Button
            href="/effects"
            text={"Browse Effects"}
         />
            
        </div>

        {children}
      </div>
    </div>
  );
}
