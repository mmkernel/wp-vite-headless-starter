import { Helmet } from "react-helmet-async";

const JsonLd = ({ data }: { data: Record<string, any> }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

export const SchemaWebSite = ({ name, url, searchUrl }: { name: string; url: string; searchUrl?: string }) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      url,
      potentialAction: searchUrl
        ? {
            "@type": "SearchAction",
            target: `${searchUrl}?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        : undefined
    }}
  />
);

export const SchemaOrganization = ({ name, url, logo }: { name: string; url: string; logo?: string }) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url,
      logo
    }}
  />
);

export const SchemaBreadcrumbs = ({ items }: { items: { name: string; url: string }[] }) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: item.url
      }))
    }}
  />
);

export const SchemaCollectionPage = ({ url, name }: { url: string; name: string }) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url,
      name
    }}
  />
);

export const SchemaArticle = ({
  url,
  title,
  description,
  datePublished,
  dateModified,
  author,
  image
}: {
  url: string;
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      datePublished,
      dateModified: dateModified || datePublished,
      author: author ? { "@type": "Person", name: author } : undefined,
      mainEntityOfPage: url,
      image
    }}
  />
);

export const SchemaWebPage = ({ url, name, description }: { url: string; name: string; description?: string }) => (
  <JsonLd
    data={{
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name,
      description
    }}
  />
);
