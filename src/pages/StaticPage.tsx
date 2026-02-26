import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Breadcrumbs from "../components/Breadcrumbs";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaWebPage, SchemaBreadcrumbs } from "../seo/schema";
import { getPageBySlug, WPPost } from "../services/wp";
import { useSettings } from "../state/settings";

const StaticPage = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [page, setPage] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    getPageBySlug(settings, slug, controller.signal)
      .then((p) => {
        setPage(p || null);
        setError(p ? null : "Page not found");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load page");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings, slug]);

  if (loading) return <Skeleton className="h-10 w-2/3" />;
  if (!page) return <p className="text-red-600">{error || "Page not found"}</p>;

  const cleanHtml = typeof window !== "undefined" ? DOMPurify.sanitize(page.content.rendered) : page.content.rendered;
  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const url = `${settings.canonicalBaseUrl || origin}/page/${page.slug}`;

  return (
    <article className="prose max-w-none prose-slate">
      <PageSEO
        title={page.title.rendered}
        description={page.excerpt?.rendered?.replace(/<[^>]+>/g, "")}
        path={`/page/${page.slug}`}
        type="webpage"
      />
      <SchemaWebPage url={url} name={page.title.rendered} description={page.excerpt?.rendered?.replace(/<[^>]+>/g, "") || ""} />
      <SchemaBreadcrumbs
        items={[
          { name: "Home", url: `${origin}/` },
          { name: page.title.rendered, url }
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", path: "/" }, { label: page.title.rendered, path: `/page/${page.slug}` }]} />
      <h1 className="text-3xl font-semibold mb-4">{page.title.rendered}</h1>
      <div className="prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </article>
  );
};

export default StaticPage;
