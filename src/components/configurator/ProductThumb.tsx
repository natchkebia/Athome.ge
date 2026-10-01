"use client";

import { useState } from "react";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { img, imgSrcset } from "@/lib/media/img";

export const LOGO_FALLBACK = "/icons/Logo.svg";

// სურათის არარსებობის ან ჩატვირთვის შეცდომისას src ვცვლით ლოგოზე —
// რომ ემთხვეოდეს იმ პროდუქტებს, რომელთა კატალოგის სურათიც თვითონ ლოგოა.
export default function ProductThumb({
  src,
  alt,
  width = 200,
}: {
  src?: string;
  alt: string;
  width?: number;
}) {
  const normalizedSrc = normalizeMediaUrl(src, LOGO_FALLBACK);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const optimizedSrc = img(normalizedSrc, width);
  const imgSrc = failedSrc === optimizedSrc ? LOGO_FALLBACK : optimizedSrc;
  const srcSet = imgSrc === LOGO_FALLBACK ? undefined : imgSrcset(normalizedSrc, width);

  return (
    <img
      src={imgSrc}
      srcSet={srcSet || undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (imgSrc !== LOGO_FALLBACK) setFailedSrc(optimizedSrc);
      }}
    />
  );
}
