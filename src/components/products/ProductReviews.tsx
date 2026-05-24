"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStorefrontProductReviews,
  StorefrontProductReview,
  StorefrontProductReviewsResponse,
} from "@/lib/api/storefront";
import AtHomeLoader from "../shared/AtHomeLoader";
import styles from "./ProductReviews.module.scss";

type ProductReviewsProps = {
  productId: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function Stars({ value }: { value: number }) {
  const rating = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className={styles.stars} aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < rating ? styles.starActive : styles.star}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: StorefrontProductReview }) {
  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div>
          <h5>{review.customerName || "მომხმარებელი"}</h5>
          <div className={styles.reviewMeta}>
            <Stars value={review.rating} />
            {review.isVerifiedPurchase && <span>დადასტურებული შეძენა</span>}
          </div>
        </div>
        <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
      </div>

      {review.title && <h6>{review.title}</h6>}
      {review.comment && <p>{review.comment}</p>}

      {(review.pros || review.cons) && (
        <div className={styles.reviewDetails}>
          {review.pros && (
            <span>
              <strong>პლუსები:</strong> {review.pros}
            </span>
          )}
          {review.cons && (
            <span>
              <strong>მინუსები:</strong> {review.cons}
            </span>
          )}
        </div>
      )}

      {review.adminReply && (
        <div className={styles.adminReply}>
          <strong>at home:</strong> {review.adminReply}
        </div>
      )}
    </article>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [data, setData] = useState<StorefrontProductReviewsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getStorefrontProductReviews(productId)
      .then((reviews) => {
        if (isMounted) setData(reviews);
      })
      .catch(() => {
        if (isMounted) setData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const summary = data?.ratingSummary;
  const reviews = useMemo(() => data?.items ?? [], [data?.items]);
  const totalReviews = summary?.totalReviews ?? data?.totalCount ?? 0;
  const average = summary?.ratingAverage ?? 0;

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>შეფასებები</span>
          <h4>მომხმარებლების შეფასებები</h4>
        </div>
        <button type="button" disabled>
          შეფასების დამატება
        </button>
      </div>

      {loading ? (
        <AtHomeLoader variant="section" />
      ) : (
        <div className={styles.content}>
          <aside className={styles.summary}>
            <strong>{average.toFixed(1)}</strong>
            <Stars value={average} />
            <span>{totalReviews} შეფასება</span>
          </aside>

          {reviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              ამ პროდუქტზე შეფასებები ჯერ არ დამატებულა.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
