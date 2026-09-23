# Ecomm

![GitHub Stars](https://img.shields.io/github/stars/5h4d0wn1k/ecomm)
![Last Commit](https://img.shields.io/github/last-commit/5h4d0wn1k/ecomm)
![GitHub Issues](https://img.shields.io/github/issues/5h4d0wn1k/ecomm)

> **Full-stack e-commerce platform** — a Next.js 15 storefront with Stripe and
> Razorpay payments, Clerk authentication, Razorpay payment gateway flows,
> ShipRocket shipping, ImageKit media, and Prisma/Neon PostgreSQL.

## Why

Ecomm is a production-style e-commerce storefront built to exercise the full
commerce stack: catalog, cart, orders, ratings, returns/refunds, seller and
admin dashboards, plus payments (Stripe + Razorpay) and shipping (ShipRocket).
The project pairs a rich Next.js App Router UI (admin, store, (public) routes)
with Prisma + Neon PostgreSQL persistence and CSRF/rate-limit middleware so the
API stays hardened. It's built as a practical reference for full-stack
commerce engineering — payments, webhooks, file uploads, and role-based
multivendor workflows in one codebase.

## Features

- **Storefront + admin/seller apps** — customer-facing store, admin console,
  seller flows under `app/`, `components/`.
- **Payments** — Stripe and Razorpay API routes (webhook + verify + capture),
  Razorpay utility modules.
- **Auth & sessions** — Clerk integration with admin/seller middlewares.
- **CMS-like content** — banners, best sellers, category marquees, newsletters,
  product cards with ratings and reviews.
- **Commerce workflows** — orders (create/cancel), returns, refunds,
  replacements, shipping-policy and return-status pages.
- **Media** — ImageKit-based upload pipeline (server + client helpers).
- **Rate limiting & safety** — `middlewares/` for CSRF, rate-limit, validation,
  admin/seller auth; `lib/fileSecurity.js`, `lib/csrf.js`.
- **Inngest + background jobs** — `inngest/` event-driven tasks.

## Quickstart

```bash
npm install
cp .env.example .env.local   # DATABASE_URL, Stripe/Razorpay/Clerk/ShipRocket keys
npx prisma migrate dev       # apply schema (postgres/Neon)
npm run dev                  # http://localhost:3000
```

Useful scripts: `npm run build` (runs `prisma generate` then `next build`),
`npm run lint`, `npm run seed` (`node prisma/seed.js`). See
`How_To_Run_Project.pdf` and `Hosting_Plan.md` in the repo root for deployment
and hosting specifics.

## Project structure

```
app/            # Next.js App Router (store, admin, api, pages)
components/     # storefront + admin components
lib/            # prisma, razorpay, csrf, fileSecurity, validation, hooks
middlewares/    # admin/seller auth, csrf, rate-limit
configs/        # imageKit, openai, razorpay
prisma/         # schema.prisma, migrations, seed.js
inngest/        # background job definitions
```

## Contributing

Contributions improving migration docs, test coverage, and payment
integration are welcome. `npm run lint` must stay clean.

## License

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

