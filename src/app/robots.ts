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
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
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
    sitemap: `${site.url}/sitemap.xml`,
  };
}
