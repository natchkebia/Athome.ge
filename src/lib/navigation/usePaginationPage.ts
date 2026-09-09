"use client";

import { useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function parsePage(value: string | null) {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function usePaginationPage(queryParam = "page") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationRef = useRef({ router, pathname, search: searchParams.toString() });

  navigationRef.current = {
    router,
    pathname,
    search: searchParams.toString(),
  };

  const setCurrentPage = useCallback(
    (page: number) => {
      const nextPage = Number.isFinite(page)
        ? Math.max(1, Math.trunc(page))
        : 1;
      const { router: currentRouter, pathname: currentPathname, search } =
        navigationRef.current;
      const nextParams = new URLSearchParams(search);

      if (nextPage === 1) nextParams.delete(queryParam);
      else nextParams.set(queryParam, String(nextPage));

      const query = nextParams.toString();
      currentRouter.replace(
        query ? `${currentPathname}?${query}` : currentPathname,
        { scroll: false }
      );
    },
    [queryParam]
  );

  return {
    currentPage: parsePage(searchParams.get(queryParam)),
    setCurrentPage,
  };
}
