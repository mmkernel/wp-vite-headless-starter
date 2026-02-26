import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import CategoryPills from "../components/CategoryPills";
import Skeleton from "../components/Skeleton";
import { PageSEO } from "../seo/meta";
import { SchemaWebSite, SchemaOrganization, SchemaBreadcrumbs } from "../seo/schema";
import { getPosts, getCategories, WPPost, WPCategory } from "../services/wp";
import { useSettings } from "../state/settings";

const HomePage = () => {
  const { settings } = useSettings();
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([getPosts(settings, 1, 6, controller.signal), getCategories(settings, controller.signal)])
      .then(([p, c]) => {
        setPosts(p);
        setCategories(c);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load content");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [settings]);

  const origin = typeof window !== "undefined" ? window.location.origin : settings.canonicalBaseUrl || "https://example.com";
  const baseUrl = settings.canonicalBaseUrl || origin || "https://example.com";

  return (
    <div className="space-y-10">
      <PageSEO title={settings.seo.defaultTitle} description={settings.seo.description} path="/" type="website" />
      <SchemaWebSite name={settings.logo.text} url={baseUrl} searchUrl={`${baseUrl}/search`} />
      <SchemaOrganization name={settings.logo.text} url={baseUrl} logo={settings.logo.imageUrl} />
      <SchemaBreadcrumbs items={[{ name: "Home", url: `${baseUrl}/` }]} />

      <section className="grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Headless WordPress</p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-slate-900">Lightning-fast content, Apple-clean UI.</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Consume WordPress content through its REST API, prerender for SEO, and ship a minimal React + Vite front-end.
          </p>
          <div className="flex gap-3">
            <a href="/blog" className="btn btn-primary">Read the blog</a>
            <a href="#categories" className="btn btn-outline">Browse categories</a>
          </div>
        </div>
        <div className="card p-6 bg-gradient-to-br from-slate-50 to-white">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-subtle">
              <p className="font-semibold">Prerender</p>
              <p className="text-slate-500">Static HTML for SEO critical routes.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-subtle">
              <p className="font-semibold">Live WP</p>
              <p className="text-slate-500">Powered by WP REST API under /backend.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-subtle">
              <p className="font-semibold">Tailwind</p>
              <p className="text-slate-500">Clean, responsive, accessible UI.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-subtle">
              <p className="font-semibold">Admin-lite</p>
              <p className="text-slate-500">Frontend-only settings, no secrets.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="latest" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest posts</h2>
          <a className="text-sm text-blue-700" href="/blog">View all</a>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="card p-4 space-y-3">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      <section id="categories" className="space-y-4">
        <h2 className="text-2xl font-semibold">Categories</h2>
        {loading ? <Skeleton className="h-10 w-1/2" /> : <CategoryPills categories={categories} />}
      </section>
    </div>
  );
};

export default HomePage;
