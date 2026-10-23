import { createPageMetadata } from "@/lib/seo-metadata";
import { WebpageJsonLd, BreadcrumbsJSONLD } from "@/lib/json-ld";
import { getAiCatalogue } from "@/lib/ai-catalogue";
import LlmInfo from "./LlmInfo";

export const metadata = createPageMetadata({
  title: "Official Information About Hyperiux Vault",
  description:
    "Structured, first-party facts about Hyperiux Vault and Hyperiux Immersion Labs for AI assistants: what Vault is, the effect library, install, pricing, licensing and contacts.",
  path: "/llm-info",
  image: "https://h1r7ltksnzlh2a5c.public.blob.vercel-storage.com/seo/llm-info.jpg",
});

// Library counts from the AI catalogue - the same numbers and category filing
// as /llms.txt, /ai-components and its JSON, so they can never disagree.
// Rebuilt hourly with the catalogue.
export const revalidate = 3600;

export default async function Page() {
  const { totals, categories } = await getAiCatalogue();
  const counts = { total: totals.effects, free: totals.free, pro: totals.pro, categories };

  return (
    <>
      <WebpageJsonLd metadata={metadata} />
      <BreadcrumbsJSONLD pathname="/llm-info" />
      <LlmInfo counts={counts} />
    </>
  );
}
