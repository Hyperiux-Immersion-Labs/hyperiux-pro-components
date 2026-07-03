import { getAllSanityEffectEntries } from "@/lib/sanity";
import { createPageMetadata } from "@/lib/seo-metadata";
import { resolveOgImageUrl } from "@/lib/media";

export async function getDemoPageMetadata(effectSlug) {
  const entries = await getAllSanityEffectEntries();
  const entry = entries.find((e) => e.effectSlug === effectSlug);
  const detailPath = entry?.categorySlug
    ? `/effects/${entry.categorySlug}/${effectSlug}`
    : `/demo/${effectSlug}`;
  const image = resolveOgImageUrl(entry?.coverImage || effectSlug, {
    defaultDirectory: "vault-listing-images",
    defaultExtension: "png",
  }) || "/seo/homepage.png";

  if (!entry?.categorySlug) {
    return createPageMetadata({
      title: `${effectSlug} Demo | Hyperiux Vault`,
      description: `Interactive demo for ${effectSlug} from the Hyperiux Vault component library.`,
      path: `/demo/${effectSlug}`,
      canonicalPath: detailPath,
      openGraphPath: `/demo/${effectSlug}`,
      languagesPath: `/demo/${effectSlug}`,
      image,
    });
  }

  return createPageMetadata({
    title: entry.title
      ? `${entry.title} Demo | Hyperiux Vault`
      : `${effectSlug} Demo | Hyperiux Vault`,
    description: `Interactive demo for ${entry.title || effectSlug}. View full documentation, code, and installation on the Hyperiux Vault effect page.`,
    path: `/demo/${effectSlug}`,
    canonicalPath: detailPath,
    openGraphPath: `/demo/${effectSlug}`,
    languagesPath: `/demo/${effectSlug}`,
    image,
  });
}
