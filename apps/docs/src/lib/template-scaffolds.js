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
// Populated by `npm run template:package <slug>` (scripts/package-template.mjs)
// - each run prints the Vercel Blob URL to paste in here after upload.
export const TEMPLATE_SCAFFOLD_BLOB_URLS = {
  elenavoss:
    "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/templates/elenavoss-fa8E4Nhbh9OV7w4tLM0YQdQM2MkI9F.zip",
  lumera: null,
  "oris-dental": null,
};

export function getTemplateScaffoldUrl(slug) {
  return TEMPLATE_SCAFFOLD_BLOB_URLS[slug] || null;
}
