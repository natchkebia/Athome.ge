"use client";

import { useState } from "react";
import { normalizeMediaUrl } from "@/lib/storefront/products";

export const LOGO_FALLBACK = "/icons/Logo.svg";

// სურათის არარსებობის ან ჩატვირთვის შეცდომისას src ვცვლით ლოგოზე —
// რომ ემთხვეოდეს იმ პროდუქტებს, რომელთა კატალოგის სურათიც თვითონ ლოგოა.
export default function ProductThumb({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const normalizedSrc = normalizeMediaUrl(src, LOGO_FALLBACK);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgSrc = failedSrc === normalizedSrc ? LOGO_FALLBACK : normalizedSrc;

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imgSrc !== LOGO_FALLBACK) setFailedSrc(normalizedSrc);
      }}
    />
  );
}
