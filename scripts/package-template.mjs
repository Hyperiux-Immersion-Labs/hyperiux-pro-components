#!/usr/bin/env node
// Packages one live template-demo page (apps/docs/src/app/(marketing)/
// template-demo/<slug>/) into a standalone, `npm i`-able Next.js project
// zip - the deliverable a template buyer downloads. See
// md/template-download-purchase-plan.md for the full plan this implements.
//
// Usage: node scripts/package-template.mjs <slug>
//   BLOB_READ_WRITE_TOKEN=... node scripts/package-template.mjs <slug>   # also uploads to Vercel Blob
//
// What this does NOT do: touch the real apps/docs app in any way. It only
// reads from template-demo/<slug>/ and a few other known-self-contained
// shared files (see TEMPLATES[slug].extraFiles below), and writes to
// dist/template-zips/ and a throwaway build dir under dist/template-build/.

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import fssync from "fs";
import archiver from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, "..");
const DOCS_ROOT = path.join(REPO_ROOT, "apps/docs");
const SCAFFOLD_DIR = path.join(__dirname, "template-scaffold");
const BUILD_ROOT = path.join(REPO_ROOT, "dist/template-build");
const ZIP_ROOT = path.join(REPO_ROOT, "dist/template-zips");

// Versions pinned to match apps/docs/package.json exactly - this repo's
// AGENTS.md warns Next/React/TS are intentionally non-default versions with
// breaking API changes, so a buyer's standalone project needs the same
// pins, not "latest".
const COMMON_DEPENDENCIES = {
  next: "16.3.1",
  react: "19.2.7",
  "react-dom": "19.2.7",
};
const COMMON_DEV_DEPENDENCIES = {
  typescript: "^6.0.3",
  "@types/node": "^26.1.2",
  "@types/react": "^19.2.18",
  "@types/react-dom": "^19.2.4",
  tailwindcss: "^4",
  "@tailwindcss/postcss": "^4.3.0",
  postcss: "^8.5.23",
};

const TSCONFIG = {
  compilerOptions: {
    target: "ES2017",
    ignoreDeprecations: "6.0",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "react-jsx",
    incremental: true,
    plugins: [{ name: "next" }],
  },
  include: [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
  ],
  exclude: ["node_modules"],
};

// Per-template manifest. `extraFiles` lists shared files (outside the
// template's own template-demo/<slug>/ folder) that need to be copied in
// and have their OWN `@/...` imports rewritten to relative paths.
// `sourceRewrites` handles the other half: files already copied by
// copyDir() (part of the template's own source) that reference one of
// those extraFiles via its old "@/..." alias, which needs rewriting to
// wherever that extraFile actually lands.
const TEMPLATES = {
  elenavoss: {
    title: "Elena Voss - Creative Web Designer Portfolio Template",
    description:
      "A single-page portfolio template for creative web designers - award-winning work, services, testimonials, and client showcase, built with GSAP scroll animations.",
    dependencies: {
      gsap: "^3.15.0",
      "@gsap/react": "^2.1.2",
      lenis: "^1.3.23",
      "lucide-react": "^0.577.0",
      zod: "^4.4.3",
    },
    extraFiles: [],
    sourceRewrites: [],
    needsGlbLoader: false,
  },
  lumera: {
    title: "Lumera - Luxury Real Estate Template",
    description:
      "A single-page luxury real estate template for Dubai property launches - residences, amenities, gallery, nearby highlights, and enquiry flows, built with GSAP scroll animations.",
    dependencies: {
      gsap: "^3.15.0",
      "@gsap/react": "^2.1.2",
      lenis: "^1.3.23",
      "lucide-react": "^0.577.0",
      zod: "^4.4.3",
      motion: "^12.40.0",
    },
    extraFiles: [
      {
        from: "apps/docs/src/components/SmoothScroll/LenisScroll.jsx",
        to: "components/SmoothScroll/LenisScroll.jsx",
        rewriteImports: [['"@/lib/motion"', '"../../lib/motion"']],
      },
      {
        from: "apps/docs/src/lib/motion.js",
        to: "lib/motion.js",
        rewriteImports: [],
      },
    ],
    sourceRewrites: [
      {
        file: "page.tsx",
        find: '"@/components/SmoothScroll/LenisScroll"',
        replace: '"./components/SmoothScroll/LenisScroll"',
      },
      {
        file: "effects/parallax-image-animation/ParallaxImageAnimation.tsx",
        find: '"@/lib/motion"',
        replace: '"../../lib/motion"',
      },
      {
        file: "effects/draggable-marquee/DraggableMarqueeComp.tsx",
        find: '"@/lib/motion"',
        replace: '"../../lib/motion"',
      },
    ],
    needsGlbLoader: false,
  },
  "oris-dental": {
    title: "Oris Dental - Modern Dental Clinic Template",
    description:
      "A modern dental clinic template built around an interactive 3D teeth visualizer, with treatment showcases, patient reviews, and online appointment booking.",
    dependencies: {
      gsap: "^3.15.0",
      lenis: "^1.3.23",
      three: "^0.182.0",
      "@react-three/fiber": "^9.6.0",
      "@react-three/drei": "^10.7.7",
    },
    extraFiles: [
      {
        from: "apps/docs/src/components/SmoothScroll/LenisScroll.jsx",
        to: "components/SmoothScroll/LenisScroll.jsx",
        rewriteImports: [['"@/lib/motion"', '"../../lib/motion"']],
      },
      {
        from: "apps/docs/src/lib/motion.js",
        to: "lib/motion.js",
        rewriteImports: [],
      },
      {
        from: "apps/docs/src/homepage-v3/components/ScrollTopOnLoad.jsx",
        to: "components/ScrollTopOnLoad.jsx",
        rewriteImports: [],
      },
    ],
    sourceRewrites: [
      {
        file: "OrisWrapper.tsx",
        find: "'@/components/SmoothScroll/LenisScroll'",
        replace: "'./components/SmoothScroll/LenisScroll'",
      },
      {
        file: "page.tsx",
        find: '"@/homepage-v3/components/ScrollTopOnLoad"',
        replace: '"./components/ScrollTopOnLoad"',
      },
      {
        // Pre-existing quirk in the source, not something packaging
        // introduced: this only resolved because template-demo/oris-dental/
        // happens to share its name with the traversal target
        // ('../../oris-dental/assets/...' from teeth-3d/ round-trips back
        // into the same folder by coincidence). Renamed to app/ here, so
        // the coincidence breaks - fix it to a direct relative path.
        file: "teeth-3d/TeethCanvas.tsx",
        find: "'../../oris-dental/assets/teeth-compressed.glb'",
        replace: "'../assets/teeth-compressed.glb'",
      },
    ],
    needsGlbLoader: true,
  },
};

function usageError(message) {
  console.error(message);
  console.error("Usage: node scripts/package-template.mjs <slug>");
  console.error(`Known slugs: ${Object.keys(TEMPLATES).join(", ")}`);
  process.exit(1);
}

async function copyDir(src, dest, { skip = [] } = {}) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (skip.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, { skip });
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// The source README.md is otherwise accurate/worth keeping (Customizing,
// Motion & accessibility sections) - only its "Running it locally" section
// is wrong, since it assumes the monorepo-nested route path. Targeted
// replace rather than a from-scratch README template, so per-template
// authored content survives.
//
// Not every template's README needs every fix here (confirmed by reading
// all three): elenavoss and oris-dental both have the broken monorepo-path
// section, lumera's "Getting started" section never referenced it to begin
// with; oris-dental's folder-tree diagram starts with its own slug as a
// bare dir name (elenavoss's does too), lumera has no such diagram; lumera
// already ships its own "## License" section, the other two don't. So each
// fix is applied only when its corresponding pattern is actually present,
// rather than assuming every template needs every fix.
function fixReadme(source, slug) {
  const brokenSection = /## Running it locally\n\n[\s\S]*?(?=\n## )/;
  const fixedSection = `## Running it locally

This is a standalone Next.js project - no monorepo, no workspace setup.

\`\`\`bash
npm install
npm run dev
\`\`\`

Then open **http://localhost:3000**.

`;

  let result = source;
  if (brokenSection.test(result)) {
    result = result.replace(brokenSection, fixedSection);
  }

  const folderTreeHeader = new RegExp(`^${slug}/\\n├── page\\.tsx`, "m");
  result = result.replace(folderTreeHeader, "app/\n├── page.tsx");

  if (!/\n## License\b/.test(result)) {
    result = result.replace(/$/, `\n## License\n\nSee [\`LICENSE.md\`](./LICENSE.md).\n`);
  }

  return result;
}

function buildPackageJson(slug, manifest) {
  // Next 16 defaults to Turbopack, which hard-errors on a `webpack()`
  // config function ("no `turbopack` config" - see next.config.mjs's
  // needsGlbLoader branch) rather than silently ignoring it. apps/docs
  // itself hits the same thing and forces `--webpack` in its own
  // dev/build scripts for exactly this reason - same fix here, for any
  // template whose next.config.mjs ends up with a webpack() block.
  const webpackFlag = manifest.needsGlbLoader ? " --webpack" : "";

  return {
    name: slug,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: `next dev${webpackFlag}`,
      build: `next build${webpackFlag}`,
      start: "next start",
    },
    dependencies: {
      ...COMMON_DEPENDENCIES,
      ...manifest.dependencies,
    },
    devDependencies: COMMON_DEV_DEPENDENCIES,
  };
}

async function buildNextConfig(manifest) {
  let content = await fs.readFile(
    path.join(SCAFFOLD_DIR, "next.config.mjs"),
    "utf8"
  );

  if (manifest.needsGlbLoader) {
    content = content.replace(
      "const nextConfig = {",
      `const nextConfig = {\n  webpack(config) {\n    config.module.rules.push({ test: /\\.(glb|gltf)$/, type: "asset/resource" });\n    return config;\n  },`
    );
  }

  return content;
}

async function packageTemplate(slug) {
  const manifest = TEMPLATES[slug];
  if (!manifest) usageError(`Unknown template slug: "${slug}"`);

  const sourceDir = path.join(DOCS_ROOT, "src/app/(marketing)/template-demo", slug);
  if (!fssync.existsSync(sourceDir)) {
    usageError(`Source folder not found: ${sourceDir}`);
  }

  const buildDir = path.join(BUILD_ROOT, slug);
  await fs.rm(buildDir, { recursive: true, force: true });
  await fs.mkdir(buildDir, { recursive: true });

  console.log(`[${slug}] copying template-demo source into app/ ...`);
  await copyDir(sourceDir, path.join(buildDir, "app"), { skip: ["README.md"] });

  for (const extra of manifest.extraFiles) {
    console.log(`[${slug}] copying extra shared file: ${extra.from}`);
    const from = path.join(REPO_ROOT, extra.from);
    const to = path.join(buildDir, "app", extra.to);
    await fs.mkdir(path.dirname(to), { recursive: true });
    let content = await fs.readFile(from, "utf8");
    for (const [find, replace] of extra.rewriteImports || []) {
      content = content.split(find).join(replace);
    }
    await fs.writeFile(to, content, "utf8");
  }

  // Files already copied by copyDir() above (part of the template's own
  // template-demo/<slug>/ source) that reference an extraFile via its old
  // "@/..." alias path - that alias doesn't exist in the generated project
  // (no @/* in tsconfig.json, matching the plan's "every template file uses
  // relative imports only"), so it must be rewritten to the extra file's
  // real relative location, same find/replace approach as extraFiles above.
  for (const rewrite of manifest.sourceRewrites || []) {
    const target = path.join(buildDir, "app", rewrite.file);
    const content = await fs.readFile(target, "utf8");
    if (!content.includes(rewrite.find)) {
      throw new Error(
        `[${slug}] sourceRewrite couldn't find ${JSON.stringify(rewrite.find)} in ${rewrite.file} - source file changed, update this manifest entry.`
      );
    }
    await fs.writeFile(target, content.split(rewrite.find).join(rewrite.replace), "utf8");
  }

  console.log(`[${slug}] writing package.json / tsconfig.json ...`);
  await fs.writeFile(
    path.join(buildDir, "package.json"),
    JSON.stringify(buildPackageJson(slug, manifest), null, 2) + "\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(buildDir, "tsconfig.json"),
    JSON.stringify(TSCONFIG, null, 2) + "\n",
    "utf8"
  );

  console.log(`[${slug}] writing next.config.mjs / postcss.config.mjs / .gitignore ...`);
  await fs.writeFile(
    path.join(buildDir, "next.config.mjs"),
    await buildNextConfig(manifest),
    "utf8"
  );
  await fs.copyFile(
    path.join(SCAFFOLD_DIR, "postcss.config.mjs"),
    path.join(buildDir, "postcss.config.mjs")
  );
  await fs.copyFile(
    path.join(SCAFFOLD_DIR, ".gitignore"),
    path.join(buildDir, ".gitignore")
  );

  console.log(`[${slug}] writing app/layout.tsx / app/globals.css ...`);
  const layoutSource = await fs.readFile(
    path.join(SCAFFOLD_DIR, "app/layout.tsx"),
    "utf8"
  );
  await fs.writeFile(
    path.join(buildDir, "app/layout.tsx"),
    layoutSource
      .replace("__TITLE__", manifest.title)
      .replace("__DESCRIPTION__", manifest.description),
    "utf8"
  );
  // The template's own app/globals.css (if any survived the copy - none of
  // the three templates ship one today) would collide with the scaffold's
  // Tailwind entry point of the same name; templates instead import their
  // own scoped stylesheet (e.g. elenavoss.css) directly from page.tsx, so
  // this is always safe to write unconditionally.
  await fs.copyFile(
    path.join(SCAFFOLD_DIR, "app/globals.css"),
    path.join(buildDir, "app/globals.css")
  );

  console.log(`[${slug}] writing README.md / LICENSE.md ...`);
  const sourceReadme = await fs.readFile(path.join(sourceDir, "README.md"), "utf8");
  await fs.writeFile(path.join(buildDir, "README.md"), fixReadme(sourceReadme, slug), "utf8");
  const licenseSource = await fs.readFile(
    path.join(SCAFFOLD_DIR, "LICENSE.md.template"),
    "utf8"
  );
  await fs.writeFile(
    path.join(buildDir, "LICENSE.md"),
    licenseSource.replace("__TITLE__", manifest.title),
    "utf8"
  );

  console.log(`[${slug}] zipping ...`);
  await fs.mkdir(ZIP_ROOT, { recursive: true });
  const zipPath = path.join(ZIP_ROOT, `${slug}.zip`);
  await zipDirectory(buildDir, zipPath);
  console.log(`[${slug}] zip written: ${path.relative(REPO_ROOT, zipPath)}`);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const buffer = await fs.readFile(zipPath);
    // addRandomSuffix explicitly true - @vercel/blob@2.x's own default is
    // false (verified against its type defs, despite an earlier assumption
    // here that it defaulted to true), which would silently overwrite the
    // SAME url on every re-run. Vercel Blob is a CDN-backed store built
    // around content at a URL being immutable, so overwriting risks serving
    // a stale cached zip for a while with no reliable way to
    // force-invalidate it. Every re-run instead gets a genuinely new URL;
    // updating a template means pasting that new URL into
    // template-scaffolds.js (a one-line, version-controlled change - same
    // review/deploy path as any other code change, with a clean git history
    // of when each template's shipped content last changed).
    const blob = await put(`templates/${slug}.zip`, buffer, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`[${slug}] uploaded to Vercel Blob: ${blob.url}`);
    console.log(
      `[${slug}] paste this into template-scaffolds.js's TEMPLATE_SCAFFOLD_BLOB_URLS["${slug}"], replacing whatever URL is there now.`
    );
  } else {
    console.log(
      `[${slug}] BLOB_READ_WRITE_TOKEN not set - zip left on disk only. ` +
        `Upload it manually and paste the resulting URL into template-scaffolds.js's TEMPLATE_SCAFFOLD_BLOB_URLS["${slug}"].`
    );
  }

  return { buildDir, zipPath };
}

function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fssync.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

const slug = process.argv[2];
if (!slug) usageError("Missing <slug> argument.");

packageTemplate(slug).catch((error) => {
  console.error(error);
  process.exit(1);
});
