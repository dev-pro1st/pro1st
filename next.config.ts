import type { NextConfig } from "next";

/**
 * Product imagery currently comes from the approved design-source hosts.
 * When Shopify is connected, add `cdn.shopify.com` (already listed) and drop
 * the demo host below.
 */
const nextConfig: NextConfig = {
  images: {
    /**
     * Next's default is 60s: after a minute every optimised image is treated
     * as stale and revalidated against its origin, which is one more request
     * and one more cache write per image per minute of traffic. Catalogue
     * imagery changes on the scale of days, not minutes; a changed Shopify
     * image gets a new URL, so a long TTL never serves a wrong picture.
     */
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "pro1st-demo.netlify.app" },
      { protocol: "https", hostname: "pro1st.in" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  /**
   * This app replaced Shopify's own Liquid storefront at the same domain.
   * Google already has `/collections/:handle` and `/pages/about-us` indexed
   * from that storefront — this app doesn't have those routes (categories
   * are `/products?category=`, About Us is `/origin`), so without a
   * redirect those URLs 404 and the indexed equity is lost outright. 301s
   * preserve it onto the equivalent route here.
   */
  /**
   * Files in `public/` are not content-hashed, so Vercel serves them
   * `max-age=0, must-revalidate`: every page view re-asks the CDN about every
   * font, logo and video, and each of those questions is a billed edge
   * request even when the answer is "304 unchanged". A day in the browser plus
   * a week of stale-while-revalidate turns repeat visits into zero requests,
   * and a replaced file still reaches visitors within the day.
   */
  async headers() {
    const longLived = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    return [
      { source: "/fonts/:path*", headers: longLived },
      { source: "/video/:path*", headers: longLived },
      { source: "/img/:path*", headers: longLived },
      { source: "/Pro1ST%20Brand%20Carousel/:path*", headers: longLived },
      { source: "/Pro1ST Brand Carousel/:path*", headers: longLived },
    ];
  },
  async redirects() {
    return [
      {
        source: "/collections/:handle",
        destination: "/products?category=:handle",
        permanent: true,
      },
      {
        source: "/pages/about-us",
        destination: "/origin",
        permanent: true,
      },
      {
        source: "/pages/contact",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
