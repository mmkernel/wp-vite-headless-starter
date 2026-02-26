import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/config/default-settings.json"), "utf-8"));
const origin = process.env.ORIGIN || settings.canonicalBaseUrl || "https://example.com";
const apiBase = `${origin}${settings.wpBasePath || "/backend"}/wp-json/wp/v2`;

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

const escape = (str = "") => str.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const main = async () => {
  const posts = await safeFetch(`${apiBase}/posts?_embed=1&per_page=20`);
  const items = posts
    .map((p) => {
      const url = `${origin}/blog/${p.slug}`;
      const desc = escape(p.excerpt?.rendered?.replace(/<[^>]+>/g, ""));
      return `  <item>\n    <title>${escape(p.title.rendered)}</title>\n    <link>${url}</link>\n    <guid>${url}</guid>\n    <description>${desc}</description>\n    <pubDate>${new Date(p.date).toUTCString()}</pubDate>\n  </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>${escape(settings.seo.defaultTitle)}</title>\n  <link>${origin}</link>\n  <description>${escape(settings.seo.description)}</description>\n${items}\n</channel>\n</rss>`;

  const outDir = path.resolve(__dirname, "../dist");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "rss.xml"), rss);
  console.log("RSS generated");
};

main();
