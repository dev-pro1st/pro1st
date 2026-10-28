import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Pages are ISR (`revalidate = 300`) and the Shopify webhook calls
 * `revalidatePath`, so all three caches are needed:
 *   KV holds the rendered pages, the Durable Object queue drives time-based
 *   revalidation, and D1 records which paths were invalidated on demand.
 *
 * KV rather than R2: R2 needs a payment method on file even for its free
 * tier, KV does not. Free KV allows 1,000 writes a day, one per page
 * regeneration, which is plenty for a catalogue this size.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
});
