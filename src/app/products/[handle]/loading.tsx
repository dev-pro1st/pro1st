import { RouteLoading } from "@/components/ui/RouteLoading";

/**
 * The product page's own loading state — the same skeleton every other route
 * shows. Being a segment-level boundary, it wraps the page but not this
 * segment's layout, which is where the existence check runs.
 */
export default function Loading() {
  return <RouteLoading />;
}
