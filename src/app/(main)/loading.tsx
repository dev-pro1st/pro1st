import { RouteLoading } from "@/components/ui/RouteLoading";

/**
 * Loading boundary for every route in the `(main)` group.
 *
 * It lives here rather than at the app root so that it does NOT wrap
 * /products/[handle]. A root boundary sits above every segment, so a product
 * page's `notFound()` ran inside an already-streaming 200 response — unknown
 * handles were served, and ISR-cached, as HTTP 200 product pages. The product
 * route carries its own boundary below its existence check instead; see
 * src/app/products/[handle]/layout.tsx.
 */
export default function Loading() {
  return <RouteLoading />;
}
