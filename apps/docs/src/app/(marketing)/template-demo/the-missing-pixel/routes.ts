// Built using Hyperiux Vault: https://vault.hyperiux.com

export const BASE = "/template-demo/the-missing-pixel";

export const ROUTES = {
  home: BASE,
  work: `${BASE}/work`,
  caseStudy: `${BASE}/work/cloudline`,
  services: `${BASE}/services`,
  service: `${BASE}/services/brand-identity`,
  about: `${BASE}/about`,
  team: `${BASE}/about#team`,
  journal: `${BASE}/journal`,
  article: `${BASE}/journal/brand-guidelines`,
  contact: `${BASE}/contact`,
  notFound: `${BASE}/404`,
};

export const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const workPath = (title: string) => `${ROUTES.work}/${slugify(title)}`;

export const PAGE_NAMES: Record<string, string> = {
  [ROUTES.home]: "Missing Pixel",
  [ROUTES.work]: "Work",
  [ROUTES.caseStudy]: "Cloudline",
  [ROUTES.services]: "Services",
  [ROUTES.service]: "Brand identity",
  [ROUTES.about]: "About",
  [ROUTES.journal]: "Journal",
  [ROUTES.article]: "Article",
  [ROUTES.contact]: "Contact",
  [ROUTES.notFound]: "404",
};
