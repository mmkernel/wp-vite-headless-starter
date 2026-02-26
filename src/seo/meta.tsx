import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useSettings } from "../state/settings";

const ensureTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);

export const DefaultSEO = () => {
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl;
  const canonicalBase = settings.canonicalBaseUrl || origin || "";
  const canonical = `${ensureTrailingSlash(canonicalBase.replace(/\/$/, ""))}${pathname.replace(/^\//, "")}`;

  return (
    <Helmet defaultTitle={settings.seo.defaultTitle} titleTemplate={settings.seo.titleTemplate}>
      <meta name="description" content={settings.seo.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={settings.logo.text} />
      <meta property="og:title" content={settings.seo.defaultTitle} />
      <meta property="og:description" content={settings.seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {settings.seo.ogImage && <meta property="og:image" content={settings.seo.ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      {settings.seo.twitter.site && <meta name="twitter:site" content={settings.seo.twitter.site} />}
      {settings.seo.twitter.creator && <meta name="twitter:creator" content={settings.seo.twitter.creator} />}
    </Helmet>
  );
};

interface PageSEOProps {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "article" | "website" | "webpage" | "collection";
  noIndex?: boolean;
}

export const PageSEO = ({ title, description, image, path = "", type = "webpage", noIndex }: PageSEOProps) => {
  const { settings } = useSettings();
  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl;
  const canonicalBase = settings.canonicalBaseUrl || origin || "";
  const canonical = `${ensureTrailingSlash(canonicalBase.replace(/\/$/, ""))}${path.replace(/^\//, "")}`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
};
