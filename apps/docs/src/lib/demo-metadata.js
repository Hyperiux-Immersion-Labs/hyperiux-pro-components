import { getAllSanityEffectEntries } from "@/lib/sanity";
import { createPageMetadata } from "@/lib/seo-metadata";

export async function getDemoPageMetadata(effectSlug) {
  const entries = await getAllSanityEffectEntries();
  const entry = entries.find((e) => e.effectSlug === effectSlug);

  if (!entry?.categorySlug) {
    return createPageMetadata({
      title: `${effectSlug} Demo | Hyperiux Vault`,
      description: `Interactive demo for ${effectSlug} from the Hyperiux Vault component library.`,
      path: `/demo/${effectSlug}`,
    });
  }

  return createPageMetadata({
    title: entry.title
      ? `${entry.title} Demo | Hyperiux Vault`
      : `${effectSlug} Demo | Hyperiux Vault`,
    description: `Interactive demo for ${entry.title || effectSlug}. View full documentation, code, and installation on the Hyperiux Vault effect page.`,
    path: `/effects/${entry.categorySlug}/${effectSlug}`,
  });
}
