// Built using Hyperiux Vault: https://vault.hyperiux.com
import { pageMetadata } from "../../metadata";
import { notFound } from "next/navigation";
import { ROUTES, slugify } from "../../routes";
import CaseBody from "../../components/work/CaseBody";
import CaseHero from "../../components/work/CaseHero";
import { PROJECTS } from "../../components/work/projects";

export const generateStaticParams = () => PROJECTS.map((project) => ({ slug: slugify(project.title) }));

export const generateMetadata = async ({ params }: PageProps) => {
  const { slug } = await params;
  const project = PROJECTS.find((item) => slugify(item.title) === slug);
  if (!project) return {};
  return pageMetadata(`${project.title} | The Missing Pixel`, project.description, `/work/${slug}`);
};

type PageProps = { params: Promise<{ slug: string }> };

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const index = PROJECTS.findIndex((item) => slugify(item.title) === slug);
  if (index === -1) notFound();
  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
  <>
    <CaseHero
      crumbs={[
        { label: "Home", href: ROUTES.home },
        { label: "Work", href: ROUTES.work },
        { label: project.title },
      ]}
      title={project.title}
      text={project.description}
      facts={[{ label: "Client", value: project.title },
          { label: "Year", value: project.year },
          { label: "What we did", value: project.meta },
          { label: "Timeline", value: "14 weeks, Dubai and London" }]}
    />
    <CaseBody project={project} next={next} />
  </>
  );
};

export default page;
