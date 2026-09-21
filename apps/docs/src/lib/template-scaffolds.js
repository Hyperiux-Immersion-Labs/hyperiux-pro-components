import "server-only";

// Deliberately its own module, NOT a field on mock-templates.js's TEMPLATES
// objects - those objects get passed as props into template-detail.jsx,
// a "use client" component, and Next.js serializes whatever a server
// component passes into a client one straight into the page's payload. A
// blob URL living on that same object would ship to every visitor's
// browser regardless of access, which is exactly what QC §13 rules out
// ("never a public/static path"). `server-only` also hard-fails the build
// if anything ever tries to import this from client code.
//
// Populated automatically by `npm run template:update <slug>`
// (scripts/package-template.mjs) - each run rebuilds the zip, uploads it,
// and rewrites the matching entry below directly.
export const TEMPLATE_SCAFFOLD_BLOB_URLS = {
  elenavoss:
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/templates/elenavoss-xe3qlcgfIl5tMmM2CPiQUyFBV34A7o.zip",
  lumera:
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/templates/lumera-3IT9F4OpC0tjAd2H8sTRovUA8wKx9L.zip",
  "oris-dental":
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/templates/oris-dental-NBdnVthO9xoDO2Mt75pfTb3CGhO45d.zip",
  kyntra:
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/templates/kyntra-tun2sSvYnaXSrIfqup1ZFs584sKf1t.zip",
};

export function getTemplateScaffoldUrl(slug) {
  return TEMPLATE_SCAFFOLD_BLOB_URLS[slug] || null;
}
