import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const ssrEntry = path.resolve(__dirname, "../dist-ssr/entry-server.js");
const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
const settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/config/default-settings.json"), "utf-8"));
const origin = process.env.ORIGIN || settings.canonicalBaseUrl || "https://example.com";
const apiBase = `${origin}${settings.wpBasePath || "/backend"}/wp-json/wp/v2`;
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

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

const collectRoutes = async () => {
  const routes = new Set(["/", "/blog"]);
  const posts = await safeFetch(`${apiBase}/posts?per_page=100&_fields=slug`);
  posts.forEach((p) => routes.add(`/blog/${p.slug}`));
  const categories = await safeFetch(`${apiBase}/categories?per_page=100&_fields=slug`);
  categories.forEach((c) => routes.add(`/category/${c.slug}`));
  const pages = await safeFetch(`${apiBase}/pages?per_page=100&_fields=slug`);
  pages.forEach((p) => routes.add(`/page/${p.slug}`));
  return Array.from(routes);
};

const renderRoute = async (route, render) => {
  const { html, helmetContext } = render(route);
  const head = `${helmetContext?.helmet?.title?.toString() || ""}${helmetContext?.helmet?.meta?.toString() || ""}${helmetContext?.helmet?.link?.toString() || ""}`;
  const page = template
    .replace("<head>", `<head>${head}`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  const filePath = route === "/" ? path.join(distDir, "index.html") : path.join(distDir, route);
  const finalPath = route === "/" ? filePath : path.join(filePath, "index.html");
  ensureDir(path.dirname(finalPath));
  fs.writeFileSync(finalPath, page, "utf-8");
  console.log("Prerendered", route);
};

const main = async () => {
  if (!fs.existsSync(ssrEntry)) {
    console.error("SSR bundle missing. Run npm run build:ssr first.");
    process.exit(1);
  }
  const { render } = await import(ssrEntry);
  const routes = await collectRoutes();
  for (const route of routes) {
    await renderRoute(route, render);
  }
};

main();
