import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getTemplateBySlug, getRelatedTemplates } from "@/lib/mock-templates";
import { createPageMetadata } from "@/lib/seo-metadata";
import { getTemplateAccessDecision } from "@/lib/template-access";
import { TemplateDetail } from "./template-detail";

export async function generateStaticParams() {
  const { TEMPLATES } = await import("@/lib/mock-templates");

  return TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return createPageMetadata({
      title: "Template Not Found | Hyperiux Vault",
      description: "This template could not be found.",
      path: `/templates/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return createPageMetadata({
    title: `${template.title} | Hyperiux Vault Templates`,
    description: template.tagline,
    path: `/templates/${slug}`,
    robots: { index: false, follow: false },
  });
}

export default async function TemplateDetailPage({ params }) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) notFound();

  const { userId } = await auth();
  const templateAccess = await getTemplateAccessDecision({
    clerkUserId: userId,
    templateSlug: slug,
    includedInAnnualPro: template.pricing?.includedInAnnualPro ?? false,
  });

  return (
    <TemplateDetail
      template={template}
      relatedTemplates={getRelatedTemplates(slug)}
      templateAccess={templateAccess}
    />
  );
}
