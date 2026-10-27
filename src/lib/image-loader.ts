/**
 * Image loader for `next/image` (wired up through `images.loaderFile`).
 *
 * The default loader sends every image through `/_next/image`, which on a
 * Worker means one invocation per image per view plus a transform on each, and
 * the adapter only caches the result when the source says `immutable` —
 * Shopify's does not. A page with 26 images was 26 billed Worker requests.
 *
 * Instead:
 *   - Shopify images are resized by Shopify's own CDN (`?width=`). It already
 *     negotiates AVIF/WebP from the `Accept` header and serves a year-long
 *     `Cache-Control`, so it does the job `/_next/image` did, for free, and
 *     the request never reaches this app.
 *   - Local files in `public/` are served as static assets, which Workers
 *     serves without invoking the Worker. They are stored at display size
 *     (the brand logos are 384px wide), so there is nothing left to resize.
 */

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

const SHOPIFY_CDN = "cdn.shopify.com";

export default function imageLoader({ src, width }: LoaderArgs): string {
  if (src.startsWith("https://")) {
    const url = new URL(src);
    if (url.hostname === SHOPIFY_CDN) {
      url.searchParams.set("width", String(width));
      return url.toString();
    }
    return src;
  }

  // A local path is emitted into `srcset`, where whitespace separates
  // candidates — "/Pro1ST Brand Carousel/…" has to be encoded to survive it.
  // Decode first so an already-encoded name ("A%20Plus.png") is not doubled.
  try {
    return encodeURI(decodeURI(src));
  } catch {
    return src;
  }
}
