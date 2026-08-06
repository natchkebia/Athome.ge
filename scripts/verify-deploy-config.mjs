import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");
const failures = [];

function requireMatch(file, pattern, reason) {
  if (!pattern.test(read(file))) failures.push(`${file}: ${reason}`);
}

requireMatch(
  "next.config.ts",
  /output\s*:\s*["']standalone["']/,
  'output: "standalone" is required by the PM2 deployment',
);

const middlewareChecks = [
  [/process\.env\.NEXT_PUBLIC_SITE_URL/, "public origin must prefer NEXT_PUBLIC_SITE_URL"],
  [/headers\.get\(["']x-forwarded-host["']\)/, "public origin must use X-Forwarded-Host"],
  [/headers\.get\(["']host["']\)/, "public origin must retain the Host fallback"],
  [/isRewrittenPass/, "the English rewrite-loop guard is missing"],
  [/savedLocale === ["']en["'] && !isRewrittenPass/, "English redirects must skip rewritten requests"],
  [/new URL\(target \+ search, publicOrigin\(request\)\)/, "redirects must use the public origin and preserve search params"],
  [/isEnglishPath \|\| savedLocale === ["']en["']/, "rewritten English requests must keep X-Lang=en"],
];

for (const [pattern, reason] of middlewareChecks) {
  requireMatch("src/middleware.ts", pattern, reason);
}

const metadataFiles = [
  "src/app/(pages)/news/[slug]/page.tsx",
  "src/app/(pages)/products/brand/[brandSlug]/layout.tsx",
  "src/app/(pages)/products/[category]/[slug]/layout.tsx",
  "src/app/(pages)/products/[category]/layout.tsx",
];

for (const file of metadataFiles) {
  const source = read(file);
  if (!source.includes("process.env.NEXT_PUBLIC_SITE_URL")) {
    failures.push(`${file}: metadata must use NEXT_PUBLIC_SITE_URL`);
  }
  if (!source.includes('https://ithome.ge')) {
    failures.push(`${file}: metadata must retain the ithome.ge fallback`);
  }
  if (source.includes('https://athome.ge')) {
    failures.push(`${file}: old athome.ge canonical/OG domain was reintroduced`);
  }
}

if (failures.length) {
  console.error("\nUnsafe deployment configuration:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nBuild stopped to prevent a broken production deployment.\n");
  process.exit(1);
}

console.log("Deploy configuration verified: standalone, public redirects, i18n guard, and SEO origin are intact.");
