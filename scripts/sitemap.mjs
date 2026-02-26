import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/config/default-settings.json"), "utf-8"));
const originEnv = process.env.ORIGIN || settings.canonicalBaseUrl || "https://example.com";
const apiBase = `${originEnv}${settings.wpBasePath || "/backend"}/wp-json/wp/v2`;

const safeFetch = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Fetch failed", url, err.message);
    return [];
  }
};

const collectUrls = async () => {
  const urls = [`${originEnv}/`, `${originEnv}/blog`];
  const posts = await safeFetch(`${apiBase}/posts?per_page=100&_fields=slug,modified`);
  posts.forEach((p) => urls.push(`${originEnv}/blog/${p.slug}`));
  const cats = await safeFetch(`${apiBase}/categories?per_page=100&_fields=slug`);
  cats.forEach((c) => urls.push(`${originEnv}/category/${c.slug}`));
  const pages = await safeFetch(`${apiBase}/pages?per_page=100&_fields=slug`);
  pages.forEach((p) => urls.push(`${originEnv}/page/${p.slug}`));
  return urls;
};

const main = async () => {
  const urls = await collectUrls();
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${now}</lastmod></url>`).join("\n") +
    "\n</urlset>";
  const outDir = path.resolve(__dirname, "../dist");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml);
  console.log("Sitemap generated");
};

main();
