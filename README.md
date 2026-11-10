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
- Dev dependency audit (2026-11-10): keep the scoped `@typescript-eslint/typescript-estree` → `minimatch@11.0.1` override until typescript-eslint ships a patched dependency range. A second plain `npm audit fix` can otherwise downgrade typescript-eslint to v6, which is incompatible with ESLint 9. The override retains the compatible v8 parser/plugin; runtime dependencies are unchanged. Verify with `npm audit`, `npm run lint`, `npm run build`, and `npm run test:security`.
- `npm run test:security` tests password creation, uniform login errors, verification requests, problem JSON, and `Retry-After` forwarding without using live accounts. Run `npm run build` and `npm audit --omit=dev` before releasing.
- Direct verification entry and login `EMAIL_NOT_VERIFIED` first show email + Send code. Only a successful resend API response opens the code field; failures keep the email step. Successful registration opens the code step because registration already requests email verification. Resend cooldown does not block code verification; registration uses the same verification screen and never silently logs into an existing account. Header sign-in forwards the email through session storage, never through a URL. After verification the customer signs in again.
- The public payment fallback uses `orders/{orderNumber}/retry-payment`; admin payment initiation/polling endpoints must not be reintroduced. Rate-limit errors preserve the backend delay and do not auto-retry. Background token refresh stops after a rate-limit response until the page is reloaded.
- CSP includes `frame-ancestors 'none'`, object/base/form restrictions, and the inline script/style allowances needed by the existing Next app. Nonce-based script CSP is a separate future improvement.
- The repository has no AI chat/stream consumer or product-question submission form. Shared API errors understand the new AI codes. Refresh tokens now use the storefront proxy cookie contract described below.

Delivery workflow: the user pushes the storefront changes and the backend owner deploys them. Local verification does not establish deployment success. Confirm the deployment destination and server Node version before release, and preserve newer live changes. After deploying and verifying the email screen, coordinate `CustomerAuth:RequireVerifiedEmail` with the backend owner.


## Proxy, session cookie and checkout conflicts (2026-11-09)

- All 29 API proxy route files (including both product handlers) use the server-only `UPSTREAM_API_URL`. Set `INTERNAL_API_URL=http://127.0.0.1:5001` in both PM2 processes: `athome-frontend` and `athome-frontend-test`. This is a runtime variable; restart the existing processes with the updated environment. Keep `NEXT_PUBLIC_API_URL` public for browser/asset/SSR URLs. Do not set the internal URL on a development machine without a local API.
- `upstreamHeaders()` forwards a validated Cloudflare client IP (fallback: the final valid X-Forwarded-For entry) only when the configured internal destination is loopback. Without the internal setting, the public fallback works but the shared IP/rate-limit problem remains. The origin firewall must admit public traffic only from Cloudflare and the Next/API listeners must stay private.
- `athome_rt` is a seven-day HttpOnly, Secure, SameSite=Strict cookie scoped to `/api/auth`. Login/social/refresh JSON never exposes the refresh token. Cookie refresh requires `X-Athome-Refresh: 1`; foreign-origin refresh/logout requests are rejected. Old body-token sessions migrate once and concurrent refresh callers share one rotation. Access tokens remain in localStorage. Logout clears the cookie even if backend logout fails.
- Checkout `COUPON_EXHAUSTED` removes the stored/input coupon and triggers one quote without it; `PROMOTION_EXHAUSTED` refreshes the quote. Both keep the backend message, stay on checkout, and wait for the corrected quote before another submission.
- Middleware upgrades an explicit HTTP Cloudflare visitor scheme to HTTPS with status 308, preserving path/query. Local development and already-HTTPS visitors are unaffected.
- `npm run test:security` includes isolated route/cookie/CSRF/IP/migration tests, both checkout conflicts, and the provider's real quote effect. All test credentials and upstream responses are synthetic.

Release verification still requires server access: read/compare the current live files, deploy the tested standalone bundle, set the runtime internal API URL in both existing PM2 processes, and verify the client's IP in the backend's refresh-token records. Confirm independent networks do not share rate limits. Check HTTP redirects and remove duplicated nginx/Cloudflare security headers there (keep the app's headers). The November 9 coupon backend change must be deployed before a live conflict can be reproduced. No server environment, nginx configuration, backend records or Cloudflare rule was modified from this local session.


### Backend deployment handoff

1. Build with the target public `NEXT_PUBLIC_SITE_URL` (never the development localhost origin) and the public `NEXT_PUBLIC_API_URL`; do not upload the development `.env.local`. Deploy using the existing standalone/PM2 workflow; include the generated `.next/static` and `public` assets with the standalone bundle. Keep the current server environment and process definitions.
2. Set `INTERNAL_API_URL=http://127.0.0.1:5001` on **both** `athome-frontend` and `athome-frontend-test`; restart each existing process with `--update-env`. The client-IP fix needs this runtime setting, not just a GitHub push.
3. Verify login returns no `refreshToken` JSON field, sets the frontend `athome_rt` cookie with HttpOnly/Secure/SameSite Strict/Path `/api/auth`, refresh succeeds, and logout clears it. Verify an existing localStorage session migrates on its first refresh. Match the cookie's seven-day TTL to the backend refresh-token lifetime.
4. Verify `http://new.athome.ge/` redirects to HTTPS, and the backend sees the shopper IP after login. Test independent networks separately; synthetic local tests do not establish live rate-limit isolation.
5. Remove duplicate security headers in nginx or Cloudflare while retaining the app's CSP/security headers. Ensure the new backend coupon reservation/errors are deployed before checking a real coupon conflict.

Local QA uses a separate synthetic backend and browser origin; no real account, order, payment, production configuration or database data is created/changed by that fixture. It is not part of the production bundle.
