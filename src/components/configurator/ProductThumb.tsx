"use client";

import { useState } from "react";

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
  const [imgSrc, setImgSrc] = useState(src || LOGO_FALLBACK);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== LOGO_FALLBACK) setImgSrc(LOGO_FALLBACK);
      }}
    />
  );
}
