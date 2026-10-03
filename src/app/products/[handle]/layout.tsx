import { notFound } from "next/navigation";
import { productRepository } from "@/lib/products";

/**
 * Product existence check, ahead of any streamed response.
 *
 * `notFound()` only sets a real 404 if it runs before the first byte is
 * sent. Inside a loading boundary it is too late: the shell has already gone
 * out as 200, so a made-up handle became a 200 page that ISR then cached and
 * search engines could index. This layout renders outside the segment's own
 * loading.tsx, and outside any boundary above it (the app-wide one lives in
 * the `(main)` group, which this route is not part of), so an unknown handle
 * fails here with a genuine 404 and the skeleton is never shown for it.
 *
 * The lookup is the same query the page and its metadata make, so the
 * in-process Storefront cache answers all three with one request.
 */
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await productRepository.getByHandle(handle);
  if (!product) notFound();

  return children;
}
