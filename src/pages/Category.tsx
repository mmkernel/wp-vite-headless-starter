import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaBreadcrumbs, SchemaCollectionPage } from "../seo/schema";
import { getCategories, getPostsByCategory, WPPost, WPCategory } from "../services/wp";
import { useSettings } from "../state/settings";

const CategoryPage = () => {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [category, setCategory] = useState<WPCategory | null>(null);
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    getCategories(settings, controller.signal)
      .then((cats) => {
        const found = cats.find((c) => c.slug === slug) || null;
        setCategory(found);
        return found;
      })
      .then((found) => {
        if (found) return getPostsByCategory(settings, found.id, controller.signal);
        return [];
      })
      .then((p) => {
        setPosts(p as WPPost[]);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load category");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings, slug]);

  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const baseUrl = settings.canonicalBaseUrl || origin || "https://example.com";

  if (loading) return <Skeleton className="h-10 w-1/2" />;
  if (!category) return <p className="text-red-600">{error || "Category not found"}</p>;

  return (
    <div className="space-y-4">
      <PageSEO title={category.name} description={category.description} path={`/category/${category.slug}`} type="collection" />
      <SchemaCollectionPage url={`${baseUrl}/category/${category.slug}`} name={category.name} />
      <SchemaBreadcrumbs
        items={[
          { name: "Home", url: `${baseUrl}/` },
          { name: "Categories", url: `${baseUrl}/category/${category.slug}` },
          { name: category.name, url: `${baseUrl}/category/${category.slug}` }
        ]}
      />
      <h1 className="text-3xl font-semibold">{category.name}</h1>
      <p className="text-slate-600">{category.description}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
