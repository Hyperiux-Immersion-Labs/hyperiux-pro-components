import { homepage, faviconPath } from './util';

function JsonLdScript({ id, data }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${homepage}#organization`,
    name: "Hyperiux",
    description: "Explore The Vault by Hyperiux UI, a curated library of modern UI effects and components built to inspire faster, cleaner, and more engaging digital experiences.",
    url: homepage,
    telephone: "",
    email: "hello@hyperiux.com",
    address: {
      "@type": 'PostalAddress',
      streetAddress: '',
      addressLocality: '',
      addressRegion: '',
      addressCountry: 'India',
    },
    logo: `${homepage}/favicon.ico`,
    sameAs: [
      "https://www.facebook.com/",
      "https://www.linkedin.com/in/",
      "https://www.linkedin.com/in/",
      "https://x.com/"
    ]
  };

  return <JsonLdScript id="organization-jsonld" data={jsonLd} />;
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${homepage}/#website`,
    name: 'Hyperiux',
    url: homepage,
    copyrightYear: new Date().getFullYear(),
    'inLanguage': "en-US",
    "publisher": [
      {
        "@id": `${homepage}/#organization`
      }
    ],
  };

  return <JsonLdScript id="website-jsonld" data={jsonLd} />;
}

export function ImageObjectJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    '@id': `${homepage}/seo/homepage.png`,
    url: `${homepage}/seo/homepage.png`,
    width: "1920",
    height: "1016",
    inLanguage: "en-US"
  };

  return <JsonLdScript id="image-object-jsonld" data={jsonLd} />;
}

export function LocalBusiness() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Hyperiux",
    "image": `https://vault.hyperiux.com/hyperiux.png`,
    "@id": "",
    "url": `${homepage}`,
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "",
      "addressLocality": "",
      "postalCode": "",
      "addressCountry": "",
      "addressRegion": "India"
    },
    "sameAs": [
      "https://www.facebook.com/",
      "https://www.linkedin.com/in/",
      "https://www.linkedin.com/in/",
      "https://x.com/"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:30",
        "closes": "06:30"
      }
    ]
  };

  return <JsonLdScript id="local-business-jsonld" data={jsonLd} />;
}

export function WebpageJsonLd({ metadata = {} }) {
  const {
    title,
    url = "/",
    description,
    date_published,
    date_modified,
    metadataBase,
    openGraph,
  } = metadata;

  const name = typeof title === "string" ? title : title.default;
  const base = metadataBase?.href || homepage;
  const fullUrl = new URL(url, base).toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${fullUrl}#webpage`,
    url: fullUrl,
    name,
    description,
    datePublished: date_published,
    dateModified: date_modified,
    publisher: {
      "@type": "Organization",
      name: "Hyperiux",
      logo: {
        "@type": "ImageObject",
        url: `${homepage}/${faviconPath}`,
      },
    },
    about: { "@id": `${fullUrl}#organization` },
    isPartOf: { "@id": `${fullUrl}#website` },
    inLanguage: openGraph?.locale || "en_US",
  };

  return <JsonLdScript id="webpage-jsonld" data={jsonLd} />;
}


function toTitleCase(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function BreadcrumbsJSONLD({ pathname }) {
  const segments = pathname.split('/').filter(Boolean);

  const itemListElements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: homepage,
    },
    ...segments.map((segment, index) => {
      const url = '/' + segments.slice(0, index + 1).join('/');
      return {
        '@type': 'ListItem',
        position: index + 2, 
        name: toTitleCase(decodeURIComponent(segment)),
        item: `${homepage}${url}`,
      };
    }),
  ];

  const breadcrumbsJSONLD = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemListElements,
  };

  return <JsonLdScript id="breadcrumbs-jsonld" data={breadcrumbsJSONLD} />;
}
function stripHTML(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export function FAQJSONLD({ faqs }) {
  const faqJSONLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": stripHTML(faq.answer),
      },
    })),
  };

  return <JsonLdScript id="faq-jsonld" data={faqJSONLD} />;
}
