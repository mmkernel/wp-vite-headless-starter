import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaCollectionPage, SchemaBreadcrumbs } from "../seo/schema";
import { getPosts, WPPost } from "../services/wp";
import { useSettings } from "../state/settings";

const BlogPage = () => {
  const { settings } = useSettings();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const page = Number(params.get("page") || 1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getPosts(settings, page, 9, controller.signal)
      .then((data) => {
        setPosts(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load posts");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings, page]);

  const onChangePage = (next: number) => navigate(`/blog?page=${next}`);
  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const baseUrl = settings.canonicalBaseUrl || origin || "https://example.com";

  return (
    <div className="space-y-6">
      <PageSEO title="Blog" description="Latest posts" path={`/blog?page=${page}`} type="collection" />
      <SchemaCollectionPage url={`${baseUrl}/blog`} name="Blog" />
      <SchemaBreadcrumbs items={[{ name: "Home", url: `${baseUrl}/` }, { name: "Blog", url: `${baseUrl}/blog` }]} />
      <h1 className="text-3xl font-semibold">Blog</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="card p-4 space-y-3">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
      <Pagination page={page} totalPages={50} onChange={onChangePage} />
    </div>
  );
};

export default BlogPage;
