import { notFound } from"next/navigation";
import { getEffectBySlug, getAllEffectSlugs } from"@/lib/registry";
import { getEffectConfig } from"@/lib/effect-configs";
import { FullscreenPreview } from"./fullscreen-preview";
import { createPageMetadata } from "@/lib/seo-metadata";

export async function generateStaticParams() {
 const slugs = getAllEffectSlugs();
 return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
 const { slug } = await params;
 const effect = getEffectBySlug(slug);

 if (!effect) {
 return createPageMetadata({
 title:"Preview Not Found",
 description: "Effect preview not found.",
 path: `/effects/${slug}/preview`,
 });
 }

 return createPageMetadata({
 title: `${effect.title} Preview | Hyperiux Vault`,
 description: `Live preview of ${effect.title}`,
 path: `/effects/${slug}/preview`,
 });
}

export default async function PreviewPage({ params }) {
 const { slug } = await params;
 const effect = getEffectBySlug(slug);

 if (!effect) {
 notFound();
 }

 const config = getEffectConfig(slug);

 return <FullscreenPreview slug={slug} effect={effect} config={config} />;
}
