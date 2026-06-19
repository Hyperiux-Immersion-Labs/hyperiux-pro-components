import { homepage } from "@/lib/util";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/sign-in/",
        "/request-access/",
        "/cli-auth/",
        "/pricing/success/",
        "/*/preview/",
      ],
    },
    sitemap: new URL("/sitemap.xml", homepage).toString(),
    host: homepage,
  };
}
