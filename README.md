# Maison Noir: premium fashion storefront

A working e-commerce site (Next.js 16, React 19, TypeScript, Tailwind v4, Motion, Lucide) with a real backend:
catalogue, search, filters, wishlist, reviews, server-priced cart, coupons, guest and account checkout,
Cash on Delivery, Razorpay online payments, order confirmation, order tracking and order history.

## Run it

```bash
npm install
cp .env.example .env.local     # set SESSION_SECRET: openssl rand -hex 32
npm run dev                    # http://localhost:3000
```

Requires **Node 22.13+** (uses the built-in `node:sqlite`). The database (`./data/store.db`) is created and
seeded with 27 sample products on first request. Delete the `data/` folder (with the server stopped) to reset.

```bash
npm run build && npm start     # production
npm run typecheck
python3 scripts/smoke-test.py http://localhost:3000   # API checks, see "Testing" below
```

## Payments (Razorpay)

1. Create API keys in the Razorpay dashboard and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`.
2. Add a webhook pointing to `https://YOUR-DOMAIN/api/webhooks/razorpay` for the `payment.captured` event and
   set `RAZORPAY_WEBHOOK_SECRET` to its secret.
3. Restart. The "UPI, cards & net banking" option is enabled automatically. Without keys it is disabled and
   Cash on Delivery still works.

How it stays honest: the browser never decides that a payment succeeded. An order is created server-side with the
Razorpay order id, stock is reserved, and the order is marked **paid** only after the server verifies Razorpay's HMAC
signature (`/api/checkout/verify`) or a signed webhook whose amount matches. Unpaid orders release their stock after
30 minutes. A payment arriving after expiry re-reserves stock or flags the order `refund_due`.
Start with Razorpay **test mode** keys and run a real test payment before going live.

## Images, hero, content

* **Product imagery is generated artwork** (`src/lib/garments.ts`), used when a product has no photos.
  To use photography, fill `images` for a product: `{ "*": ["/images/tee-1.jpg", "/images/tee-2.jpg"], "Black": [...] }`
  (keys are colour names; `"*"` is the default set). Put files in `public/images/` or use any HTTPS host (allowed in
  `next.config.ts`; tighten `remotePatterns` for production). Photos automatically replace the art everywhere.
* Hero: set `NEXT_PUBLIC_HERO_VIDEO` and/or `NEXT_PUBLIC_HERO_IMAGE`.
* Products and coupons: `src/lib/catalog-seed.ts` (seeded only into an empty database; edit the DB afterwards).
* Brand, navigation, shipping/COD rules, support email and phone: `src/config/site.ts` (**placeholders: replace them**).
* Policy pages are sample text in `src/config/pages.tsx`: have them reviewed before launch.
* Reviews and testimonials are **sample data** (`is_sample = 1`). Remove them before launch:
  `DELETE FROM reviews WHERE is_sample = 1;` and edit `TESTIMONIALS` in `src/config/site.ts`.
  Set `NEXT_PUBLIC_DEMO_MODE=false` to hide the footer demo note.

Sample coupons: `WELCOME10`, `MAISON500`, `FREESHIP`, `FESTIVE15` (expires 2026-11-30).

## Deployment

SQLite needs a **persistent disk** (set `DATABASE_DIR`), so use a VM, a container with a volume, Fly.io, Railway or
similar. Serverless hosts (Vercel) will lose data. For those, move to Postgres/Supabase: `supabase/schema.sql` is the
equivalent schema, and all SQL is isolated in `src/lib/{db,repo,auth,orders}.ts`.
Set `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` and the Razorpay variables in the host's environment.

## Security notes

Passwords are scrypt-hashed; sessions are random tokens stored hashed, in an httpOnly SameSite=Lax cookie (Secure in
production). Mutating endpoints check same-origin; auth, checkout and order lookup are rate limited (in memory, so use a
shared store if you run several instances). Prices, stock, coupons and shipping are computed on the server; the browser
only sends product, colour, size and quantity. Guest order pages are protected by a signed link.

## Accessibility and motion

Keyboard-operable menus, drawers and dialogs with focus trapping and Escape to close, labelled controls, live regions
for totals and stock, visible focus. All animation respects `prefers-reduced-motion` (Motion `reducedMotion="user"`,
smooth scrolling off). Page transitions animate on entry only.

## Testing

`scripts/smoke-test.py` runs 40 API checks (pricing, coupons, stock, auth, orders, signature and webhook verification).
Start the server in dev mode with test values, e.g.
`RAZORPAY_KEY_ID=rzp_test_x RAZORPAY_KEY_SECRET=testsecret RAZORPAY_WEBHOOK_SECRET=testwebhook npm run dev`.
It uses dev mode because the production session cookie is `Secure` and a plain-http test client won't send it back.

## Not included

Email/SMS notifications, an admin dashboard (manage products in the database for now), shipping-carrier integration,
refund automation, GST invoices.
