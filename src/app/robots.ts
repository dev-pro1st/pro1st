import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/**
 * `/products` is server-rendered per request, and its filter links toggle
 * query parameters that combine freely — an effectively unbounded set of
 * uncacheable URLs for a crawler to walk. Category URLs (the ones in the
 * sitemap) stay crawlable; every other query on /products is closed.
 *
 * Google and Bing resolve allow/disallow by the longest matching rule, so:
 *   /products?category=mixers           → allowed  ("/products?category=")
 *   /products?category=mixers&tag=x     → blocked  ("/products?category=*&")
 *   /products?tag=x, ?stock=in, ?min=…  → blocked  ("/products?")
 */
const BLOCKED_CRAWLERS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "AspiegelBot",
  "Bytespider",
  "DataForSeoBot",
  "BLEXBot",
  "serpstatbot",
  "Barkrowler",
  "MegaIndex",
  "ZoominfoBot",
  "ImagesiftBot",
  "Diffbot",
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Amazonbot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Crawlers that bring no shoppers: SEO-tool scrapers and AI-training
      // harvesters. Search engines and link-preview bots are not listed. This
      // is the polite layer; vercel.json denies the same agents at the
      // firewall for the ones that ignore it.
      { userAgent: BLOCKED_CRAWLERS, disallow: "/" },
      {
      userAgent: "*",
      allow: ["/", "/products?category="],
      disallow: [
        "/cart",
        "/search",
        "/checkout",
        "/api",
        "/products?",
        "/products?category=*&",
      ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
