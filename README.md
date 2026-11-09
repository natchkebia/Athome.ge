This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Storefront security hardening (2026-11-09)

- Use Node `^20.19.0 || ^22.13.0 || >=24.0.0` and `npm ci`. Next.js is pinned to 15.5.29; the lockfile includes patched DOMPurify and Swiper. Next's PostCSS and Sharp dependencies are explicitly overridden to patched compatible versions. Review these overrides when upgrading Next.
- `npm run test:security` tests password creation, uniform login errors, verification requests, problem JSON, and `Retry-After` forwarding without using live accounts. Run `npm run build` and `npm audit --omit=dev` before releasing.
- Direct verification entry and login `EMAIL_NOT_VERIFIED` first show email + Send code. Only a successful resend API response opens the code field; failures keep the email step. Successful registration opens the code step because registration already requests email verification. Resend cooldown does not block code verification; registration uses the same verification screen and never silently logs into an existing account. Header sign-in forwards the email through session storage, never through a URL. After verification the customer signs in again.
- The public payment fallback uses `orders/{orderNumber}/retry-payment`; admin payment initiation/polling endpoints must not be reintroduced. Rate-limit errors preserve the backend delay and do not auto-retry. Background token refresh stops after a rate-limit response until the page is reloaded.
- CSP includes `frame-ancestors 'none'`, object/base/form restrictions, and the inline script/style allowances needed by the existing Next app. Nonce-based script CSP is a separate future improvement.
- The repository has no AI chat/stream consumer or product-question submission form. Shared API errors understand the new AI codes; refresh-token storage is unchanged pending the announced backend cookie contract.

Release is pending: the configured GitHub account currently has read-only access and no authorized PM2 host/path/restart deployment mapping is available. `ithome.ge` currently points visitors to `new.athome.ge`, which labels itself a test environment. Confirm the deployment destination and the server Node version before release; preserve newer live changes. After deploying and verifying the email screen, coordinate `CustomerAuth:RequireVerifiedEmail` with the backend owner. The local implementation is not evidence that the screen is live.
