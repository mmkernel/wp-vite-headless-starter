import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Breadcrumbs from "../components/Breadcrumbs";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaArticle, SchemaBreadcrumbs, SchemaWebPage } from "../seo/schema";
import { getPostBySlug, WPPost, getFeaturedMediaUrl, getAuthorName, getCategoryObjects } from "../services/wp";
import { useSettings } from "../state/settings";

const PostPage = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    getPostBySlug(settings, slug, controller.signal)
      .then((p) => {
        setPost(p || null);
        setError(p ? null : "Post not found");
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load post");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings, slug]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!post) return <p className="text-red-600">{error || "Post not found"}</p>;

  const cleanHtml = typeof window !== "undefined" ? DOMPurify.sanitize(post.content.rendered) : post.content.rendered;
  const image = getFeaturedMediaUrl(post);
  const author = getAuthorName(post);
  const categories = getCategoryObjects(post);
  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const url = `${settings.canonicalBaseUrl || origin}/blog/${post.slug}`;

  return (
    <article className="prose max-w-none prose-slate">
      <PageSEO
        title={post.title.rendered}
        description={post.excerpt.rendered.replace(/<[^>]+>/g, "")}
        image={image}
        path={`/blog/${post.slug}`}
        type="article"
      />
      <SchemaArticle
        url={url}
        title={post.title.rendered}
        description={post.excerpt.rendered.replace(/<[^>]+>/g, "")}
        datePublished={post.date}
        author={author}
        image={image}
      />
      <SchemaBreadcrumbs
        items={[
          { name: "Home", url: `${origin}/` },
          { name: "Blog", url: `${origin}/blog` },
          { name: post.title.rendered, url }
        ]}
      />
      <SchemaWebPage url={url} name={post.title.rendered} description={post.excerpt.rendered.replace(/<[^>]+>/g, "")} />
      <Breadcrumbs items={[{ label: "Home", path: "/" }, { label: "Blog", path: "/blog" }, { label: post.title.rendered, path: `/blog/${post.slug}` }]} />
      <h1 className="text-4xl font-semibold mb-2">{post.title.rendered}</h1>
      <p className="text-sm text-slate-500 mb-4 flex gap-2 items-center flex-wrap">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        {author && <span>• {author}</span>}
        {categories.map((cat) => (
          <span key={cat.id} className="px-2 py-1 bg-slate-100 rounded-full">{cat.name}</span>
        ))}
      </p>
      {image && <img src={image} alt={post.title.rendered} className="w-full rounded-xl shadow-subtle mb-6" loading="lazy" />}
      <div className="prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </article>
  );
};

export default PostPage;
