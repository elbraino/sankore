// @ts-check
import { defineConfig } from "astro/config";

import { SITE_URL } from "./site.config.ts";

// https://astro.build/config
export default defineConfig({
  // Always the production origin. Astro derives canonical URLs, the sitemap,
  // and Astro.site from this — a staging origin must never appear here.
  // See the SITE_STAGING_URL note in site.config.ts.
  site: SITE_URL,

  // Custom domain is root-served, so no `base` path.
  // If this ever moves to a GitHub Pages *project* site
  // (user.github.io/<repo>/), add `base` and audit every internal link.

  // Matches the /people/, /works/, /events/ URL scheme in CLAUDE.md.
  trailingSlash: "always",
});
