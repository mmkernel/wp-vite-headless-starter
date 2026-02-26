import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaBreadcrumbs } from "../seo/schema";
import { searchPosts, WPPost } from "../services/wp";
import { useSettings } from "../state/settings";

const SearchPage = () => {
  const { settings } = useSettings();
  const [params] = useSearchParams();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const query = params.get("q") || "";

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    setLoading(true);
    searchPosts(settings, query, controller.signal)
      .then((data) => {
        setPosts(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Search failed");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings, query]);

  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const baseUrl = settings.canonicalBaseUrl || origin || "https://example.com";

  return (
    <div className="space-y-4">
      <PageSEO title={`Search: ${query || ""}`} description="Search results" path={`/search?q=${query}`} />
      <SchemaBreadcrumbs items={[{ name: "Home", url: `${baseUrl}/` }, { name: "Search", url: `${baseUrl}/search?q=${query}` }]} />
      <h1 className="text-3xl font-semibold">Search</h1>
      {!query && <p className="text-slate-500">Type something to search.</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <Skeleton className="h-10 w-full" />}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {!loading && query && posts.length === 0 && <p className="text-slate-500">No results.</p>}
    </div>
  );
};

export default SearchPage;
