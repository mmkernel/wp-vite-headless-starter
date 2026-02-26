import { Settings } from "../state/settings";

export interface WPImageSizes {
  medium?: { source_url: string };
  large?: { source_url: string };
  full?: { source_url: string };
}

export interface WPFeaturedMedia {
  source_url?: string;
  alt_text?: string;
  media_details?: { sizes?: WPImageSizes };
}

export interface WPEmbedded {
  author?: { name: string }[];
  "wp:featuredmedia"?: WPFeaturedMedia[];
  "wp:term"?: { id: number; name: string; slug: string }[][];
}

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  categories: number[];
  _embedded?: WPEmbedded;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const cache = new Map<string, { timestamp: number; data: any }>();
// shorter TTL so new posts/categories show up quickly; still caches repeated calls
const TTL = 1000 * 30; // 30 seconds

const getOrigin = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_CANONICAL_BASE) return import.meta.env.VITE_CANONICAL_BASE;
  return "https://example.com";
};

export const buildApiBase = (settings: Pick<Settings, "wpBasePath">) => {
  const origin = getOrigin();
  const basePath = settings.wpBasePath || "/backend";
  return `${origin}${basePath}/wp-json/wp/v2`;
};

const fetchJson = async <T>(url: string, signal?: AbortSignal, cacheKey?: string): Promise<T> => {
  const key = cacheKey || url;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < TTL) return cached.data as T;

  if (typeof window !== "undefined" && cacheKey) {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (now - parsed.timestamp < TTL) {
          cache.set(key, parsed);
          return parsed.data as T;
        }
      } catch {
        /* ignore parse errors */
      }
    }
  }

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  const data = (await res.json()) as T;
  cache.set(key, { timestamp: now, data });
  if (typeof window !== "undefined" && cacheKey) {
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
  }
  return data;
};

export const getPosts = async (settings: Settings, page = 1, perPage = 10, signal?: AbortSignal, force = false) => {
  const api = buildApiBase(settings);
  const url = `${api}/posts?_embed=1&per_page=${perPage}&page=${page}`;
  return fetchJson<WPPost[]>(url, signal, force ? undefined : `posts_${page}`);
};

export const searchPosts = async (settings: Settings, query: string, signal?: AbortSignal) => {
  const api = buildApiBase(settings);
  const url = `${api}/posts?_embed=1&search=${encodeURIComponent(query)}`;
  return fetchJson<WPPost[]>(url, signal, `search_${query}`);
};

export const getCategories = async (settings: Settings, signal?: AbortSignal, force = false) => {
  const api = buildApiBase(settings);
  const url = `${api}/categories?per_page=100`;
  return fetchJson<WPCategory[]>(url, signal, force ? undefined : "categories_all");
};

export const getPageBySlug = async (settings: Settings, slug: string, signal?: AbortSignal) => {
  const api = buildApiBase(settings);
  const url = `${api}/pages?slug=${slug}&_embed=1`;
  const pages = await fetchJson<WPPost[]>(url, signal, `page_${slug}`);
  return pages[0];
};

export const getPostBySlug = async (settings: Settings, slug: string, signal?: AbortSignal) => {
  const api = buildApiBase(settings);
  const url = `${api}/posts?slug=${slug}&_embed=1`;
  const posts = await fetchJson<WPPost[]>(url, signal, `post_${slug}`);
  return posts[0];
};

export const getPostsByCategory = async (settings: Settings, categoryId: number, signal?: AbortSignal) => {
  const api = buildApiBase(settings);
  const url = `${api}/posts?categories=${categoryId}&_embed=1`;
  return fetchJson<WPPost[]>(url, signal, `cat_${categoryId}`);
};

export const getFeaturedMediaUrl = (post?: WPPost) => {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  const sizes = media?.media_details?.sizes;
  return sizes?.large?.source_url || media?.source_url;
};

export const getAuthorName = (post?: WPPost) => post?._embedded?.author?.[0]?.name;

export const getCategoryObjects = (post?: WPPost) => post?._embedded?.["wp:term"]?.[0] || [];
