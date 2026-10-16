import { effectCategories } from "@/lib/categories";
import { getAiCatalogue, toLlmsCategoryTxt } from "@/lib/ai-catalogue";

// /llms/<category>.txt - one category's slice of /llms-full.txt, linked from
// /llms.txt, so AI tools can read a whole category without truncating it.
export const revalidate = 3600;

export function generateStaticParams() {
  return effectCategories.filter((category) => category.id !== "featured").map((category) => ({ file: `${category.slug}.txt` }));
}

export async function GET(_request, { params }) {
  const { file } = await params;
  const text = file.endsWith(".txt") ? toLlmsCategoryTxt(await getAiCatalogue(), file.slice(0, -4)) : null;

  if (!text) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
