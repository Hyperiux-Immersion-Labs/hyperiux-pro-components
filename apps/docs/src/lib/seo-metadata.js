import { homepage } from "./util";

const DEFAULT_TITLE = "Hyperiux Vault - Beautiful Effects for Your Website";
const DEFAULT_DESCRIPTION =
  "A collection of animated effects and UI components. Copy-paste or use our CLI to add stunning animations to your Next.js project.";
const DEFAULT_IMAGE = "/seo/homepage.png";

export function getCanonicalUrl(path = "/") {
  return new URL(path || "/", homepage).toString();
}

export function createPageMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords,
  robots,
} = {}) {
  const canonical = getCanonicalUrl(path);

  return {
    title,
    description,
    keywords,
    url: path,
    alternates: {
      canonical,
    },
    robots,
  };
}

export function createRootMetadata() {
  const title = DEFAULT_TITLE;
  const description = DEFAULT_DESCRIPTION;
  const canonical = getCanonicalUrl("/");
  const imageUrl = getCanonicalUrl(DEFAULT_IMAGE);

  return {
    metadataBase: new URL(homepage),
    ...createPageMetadata({
      title,
      description,
      path: "/",
      robots: {
        index: true,
        follow: true,
      },
    }),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Hyperiux Vault",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Hyperiux Vault",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
