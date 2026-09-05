"use client";

import styles from "./ProductPagination.module.scss";

type ProductPaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  locale?: "ka" | "en";
};

export const PRODUCTS_PER_PAGE = 9;
const PAGE_WINDOW = 1;

function pageItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);
  for (
    let page = Math.max(1, currentPage - PAGE_WINDOW);
    page <= Math.min(totalPages, currentPage + PAGE_WINDOW);
    page += 1
  ) {
    pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap<(number | "ellipsis")>((page, index) => {
    const previous = sorted[index - 1];
    return index > 0 && page - previous > 1 ? ["ellipsis", page] : [page];
  });
}

export default function ProductPagination({
  currentPage,
  totalItems,
  pageSize = PRODUCTS_PER_PAGE,
  onPageChange,
  locale = "ka",
}: ProductPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const en = locale === "en";
  const goToPage = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={styles.pagination}
      aria-label={en ? "Product pages" : "პროდუქტების გვერდები"}
    >
      <button
        type="button"
        className={styles.arrow}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={en ? "Previous page" : "წინა გვერდი"}
      >
        ‹
      </button>

      {pageItems(currentPage, totalPages).map((item, index) =>
        item === "ellipsis" ? (
          <span className={styles.ellipsis} key={`ellipsis-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            className={item === currentPage ? styles.active : undefined}
            onClick={() => goToPage(item)}
            aria-label={`${en ? "Page" : "გვერდი"} ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className={styles.arrow}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={en ? "Next page" : "შემდეგი გვერდი"}
      >
        ›
      </button>
    </nav>
  );
}
