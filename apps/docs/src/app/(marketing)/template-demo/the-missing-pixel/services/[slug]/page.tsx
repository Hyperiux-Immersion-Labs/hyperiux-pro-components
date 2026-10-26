// Built using Hyperiux Vault: https://vault.hyperiux.com
import { notFound } from "next/navigation";
import { pageMetadata } from "../../metadata";
import ServiceDetail from "../../components/services/ServiceDetail";
import { SERVICES } from "../../components/services/services";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () =>
  SERVICES.map((service) => ({ slug: service.slug }));

export const generateMetadata = async ({ params }: PageProps) => {
  const { slug } = await params;
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) return {};
  return pageMetadata(
    `${service.title} | The Missing Pixel`,
    service.description,
    `/services/${slug}`,
  );
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const service = SERVICES.find((item) => item.slug === slug);
  if (!service) notFound();

  return <ServiceDetail service={service} />;
};

export default page;
