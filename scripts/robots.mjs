import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/config/default-settings.json"), "utf-8"));
const origin = process.env.ORIGIN || settings.canonicalBaseUrl || "https://example.com";
const robots = `User-agent: *\nAllow: /\nDisallow: /backend\nSitemap: ${origin}/sitemap.xml`;
const outDir = path.resolve(__dirname, "../dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
console.log("robots.txt generated");
