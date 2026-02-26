# WP Vite Headless Starter

Modern headless WordPress frontend built with Vite + React + TypeScript + Tailwind. Serves from `/` while WordPress lives in `/backend` on the same VPS.

## Quick start
1. Install deps (Node 18+): `npm install`
2. Copy env: `cp .env.example .env` (optional; `VITE_ADMIN_CODE` recommended for non-localhost admin access).
3. Dev server: `npm run dev`

## Build & prerender
```
npm run build          # client bundle -> dist
npm run build:ssr      # SSR bundle -> dist-ssr
npm run prerender      # prerender /, /blog, posts, categories, pages
npm run sitemap        # dist/sitemap.xml
npm run robots         # dist/robots.txt
npm run rss            # dist/rss.xml
# Convenience
npm run generate       # runs all of the above
```
Set `ORIGIN=https://MY_DOMAIN.com` when running the generation scripts to emit correct absolute URLs.

## .env reference
```
VITE_ADMIN_CODE=changeme   # optional, guards /admin outside localhost
VITE_CANONICAL_BASE=https://MY_DOMAIN.com
VITE_WP_BASE_PATH=/backend
```

## Routes
- `/` home
- `/blog` list (paginated via `?page=`)
- `/blog/:slug` single post
- `/category/:slug`
- `/page/:slug`
- `/search?q=`
- `/admin` frontend-only settings (non-secret) with localStorage persistence
- `/404`

## What the admin panel stores
Non-secret public config only: canonical base URL, WP base path, brand colors (from a safe palette), logo text/image, SEO defaults, navigation items. Saved in `localStorage` under `site_settings_v1` with export/import/reset. Guard: requires `VITE_ADMIN_CODE` unless on localhost; shows warning that it is **not** real auth.

## WordPress REST endpoints used
Base: `${window.location.origin}${settings.wpBasePath || "/backend"}/wp-json/wp/v2`
- `/posts?_embed=1&per_page=10&page=1`
- `/categories?per_page=100`
- `/pages?slug=:slug&_embed=1`
- `/posts?slug=:slug&_embed=1`
- `/posts?categories=:id&_embed=1`
- `/posts?search=:term&_embed=1`

## SEO features
- `react-helmet-async` for meta, canonical, OG/Twitter
- JSON-LD (WebSite, Organization, CollectionPage, WebPage, Article, BreadcrumbList)
- Prerendered HTML for critical routes and dynamic slugs (posts/categories/pages)
- Generated `sitemap.xml`, `robots.txt`, `rss.xml`
- Canonical URLs use `canonicalBaseUrl` (fallback `window.location.origin`) with trailing slash consistency

## Content safety & UX
- WP HTML sanitized with DOMPurify (client-only fallback on SSR)
- Featured images lazy-loaded; skeleton states & friendly errors
- Caching with TTL for categories/posts in memory + localStorage
- AbortController cancels fetches on route change

## Deployment (Nginx + PHP-FPM)
Example snippet (adjust paths/users):
```
server {
  listen 80;
  server_name MY_DOMAIN.com;

  root /var/www/headless/dist;
  index index.html;

  location /backend/ {
    alias /var/www/headless/backend/; # WordPress
    try_files $uri $uri/ /backend/index.php?$args;
    location ~ \.php$ {
      include fastcgi_params;
      fastcgi_param SCRIPT_FILENAME $request_filename;
      fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }
  }

  location / {
    try_files $uri /index.html;
  }

  location ~* \.(?:js|css|svg|png|jpg|jpeg|webp|ico)$ {
    try_files $uri /index.html;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

## Notes on SPA SEO
Traditional SPAs render content client-side, so crawlers may miss dynamic pages. The included prerender + sitemap + JSON-LD pipeline outputs static HTML for key routes (home, blog, all posts/categories/pages) and feeds crawlers rich metadata, solving most SEO gaps while keeping a fast client experience.
