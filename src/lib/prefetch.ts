/**
 * Prefetch policy for `<Link>`.
 *
 * `/products` (and every `/products?…` filter or category URL) is the one
 * dynamically rendered page in the storefront: it reads `searchParams`, so it
 * is served `no-store` and every request runs a server function. Next prefetches
 * each `<Link>` the moment it scrolls into view, and for a dynamic route each
 * of those prefetches is its own function invocation that the CDN cannot
 * cache. The homepage alone carries ~17 distinct category/brand links and the
 * filter sidebar ~26, so a single visit used to fan out into dozens of
 * uncacheable renders nobody asked for.
 *
 * These links still navigate normally; they just render on click instead of
 * speculatively. Every other route is static or ISR and served from the CDN,
 * so its prefetch is cheap and stays on.
 */
export function prefetchFor(href: string): false | undefined {
  const path = href.split(/[?#]/)[0];
  return path === "/products" ? false : undefined;
}
