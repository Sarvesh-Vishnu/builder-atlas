// Writes every route to static HTML after `vite build` + the SSR build, so the
// site reads with JavaScript off, is crawlable, and deep links work on GitHub
// Pages. Also writes 404.html, sitemap.xml and robots.txt.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");
const { render, allRoutes, metaFor, SITE_URL } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);

const template = await readFile(join(dist, "index.html"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const canonical = (route) => `${SITE_URL}${route === "/" ? "/" : `${route}/`}`;

function page(route, { indexable = true } = {}) {
  const { title, description } = metaFor(route);
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    indexable ? `<link rel="canonical" href="${canonical(route)}" />` : `<meta name="robots" content="noindex" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Builder Atlas" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical(route)}" />`,
    `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n    ");
  return template
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root" data-route="${route}">${render(route)}</div>`);
}

const routes = allRoutes();
for (const route of routes) {
  const file = route === "/" ? join(dist, "index.html") : join(dist, route, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page(route));
}
await writeFile(join(dist, "404.html"), page("/not-found", { indexable: false }));

const today = new Date().toISOString().slice(0, 10);
await writeFile(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `  <url><loc>${canonical(r)}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`,
);
await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await rm(ssrDir, { recursive: true, force: true });
console.log(`pre-rendered ${routes.length} routes + 404, sitemap, robots`);
