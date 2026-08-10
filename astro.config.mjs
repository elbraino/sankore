// @ts-check
import { defineConfig, fontProviders } from "astro/config";

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

  // Fonts are downloaded at BUILD time and served from our own origin.
  // Deliberate: visitors to a security-research index in this region should
  // not have their IP handed to a third-party font CDN on every page view.
  // CLAUDE.md, "No external tracking scripts" — same principle.
  fonts: [
    {
      // Display — "a sharp grotesque with character" (CLAUDE.md).
      name: "Space Grotesk",
      cssVariable: "--font-display",
      provider: fontProviders.fontsource(),
      weights: [500, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      // Body — readable humanist sans.
      name: "Inter",
      cssVariable: "--font-body",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      // Mono — metadata, coordinates, and the plate references.
      name: "IBM Plex Mono",
      cssVariable: "--font-mono",
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      // Arabic-capable, in the stack from day one (CLAUDE.md, bilingual-ready).
      name: "IBM Plex Sans Arabic",
      cssVariable: "--font-arabic",
      provider: fontProviders.fontsource(),
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["arabic", "latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
  ],
});
