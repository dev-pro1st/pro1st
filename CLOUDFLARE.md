# Deploying PRO1ST on Cloudflare Workers

The storefront runs on Cloudflare Workers through the OpenNext adapter
(`@opennextjs/cloudflare`). Config: `wrangler.jsonc`, `open-next.config.ts`,
`public/_headers`.

## How it is wired

| Need | Cloudflare piece | Binding |
| --- | --- | --- |
| Static files, `/_next/static` | Workers Assets (free, no Worker invocation) | `ASSETS` |
| ISR pages (`revalidate = 300`) | KV namespace (no card needed) | `NEXT_INC_CACHE_KV` |
| Time-based revalidation | Durable Object queue | `NEXT_CACHE_DO_QUEUE` |
| `revalidatePath` from the Shopify webhook | D1 tag cache | `NEXT_TAG_CACHE_D1` |
| Self calls (revalidation) | service binding | `WORKER_SELF_REFERENCE` |

Images do not go through the Worker. `src/lib/image-loader.ts` points Shopify
images at Shopify's own resizing CDN and serves local files as static assets.

## One-time setup (in the account that will own the store)

1. `npx wrangler login` (no card needed: Workers, KV, D1 and Durable Objects
   all have free tiers that do not ask for one).
2. `npx wrangler kv namespace create pro1st-next-cache`, then put the returned
   `id` in `wrangler.jsonc` (replace `REPLACE_WITH_KV_NAMESPACE_ID`).
3. `npx wrangler d1 create pro1st-tag-cache`, then put the returned
   `database_id` in `wrangler.jsonc` (replace `REPLACE_WITH_D1_DATABASE_ID`).
4. Apply the tag-cache schema once the D1 exists (see the adapter docs for
   the `revalidations` table).
5. Secrets, one per line (`npx wrangler secret put NAME`). Names only:
   `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`,
   `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`, `SHOPIFY_API_VERSION`,
   `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_ADMIN_CLIENT_ID`,
   `SHOPIFY_ADMIN_CLIENT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
   `RAZORPAY_WEBHOOK_SECRET`, `JUDGEME_PLATFORM`, `JUDGEME_PRIVATE_TOKEN`,
   `JUDGEME_SHOP_DOMAIN`.
6. `NEXT_PUBLIC_RAZORPAY_KEY_ID` is inlined at build time, so it must be in the
   environment of the machine that runs `npm run deploy` (or the Workers Builds
   build variables), not only as a secret.

## Deploy

```
npm run preview   # build and run locally in the Workers runtime (uses .dev.vars)
npm run deploy    # build, upload, publish
```

`.dev.vars` is gitignored; copy the names above into it for local previews.

## After the first deploy

- Add `pro1st.in` as a custom domain on the Worker (Workers → Settings →
  Domains), with the domain's DNS on Cloudflare.
- Repoint the Shopify webhooks (`/api/revalidate`) and the Razorpay webhook
  (`/api/webhooks/razorpay`) if the host name changed.
- `vercel.json` is ignored here. Its bot rules live in Cloudflare instead:

### Bot rules (Security → WAF → Custom rules, action Block)

```
(http.user_agent contains "AhrefsBot") or (http.user_agent contains "SemrushBot")
or (http.user_agent contains "MJ12bot") or (http.user_agent contains "DotBot")
or (http.user_agent contains "PetalBot") or (http.user_agent contains "Bytespider")
or (http.user_agent contains "DataForSeoBot") or (http.user_agent contains "BLEXBot")
or (http.user_agent contains "serpstatbot") or (http.user_agent contains "Barkrowler")
or (http.user_agent contains "MegaIndex") or (http.user_agent contains "ImagesiftBot")
or (http.user_agent contains "Diffbot") or (http.user_agent contains "GPTBot")
or (http.user_agent contains "CCBot") or (http.user_agent contains "ClaudeBot")
or (http.user_agent contains "Amazonbot") or (http.user_agent contains "Scrapy")
or (http.user_agent contains "HTTrack") or (http.user_agent contains "masscan")
or (http.user_agent contains "zgrab")
```

Also switch on Security → Bots → Bot Fight Mode. Blocked requests never reach
the Worker, so they cost nothing.

## Costs to watch

- Workers Paid is $5/month: 10M requests, then $0.30 per extra million.
- Static assets and `/_next/static` are free and unlimited.
- Every page view that is not served from the ISR cache is one Worker request.
