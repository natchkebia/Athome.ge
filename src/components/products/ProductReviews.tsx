"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStorefrontProductReviews,
  submitStorefrontProductReview,
  StorefrontProductReview,
  StorefrontProductReviewsResponse,
} from "@/lib/api/storefront";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
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

function ReviewCard({
  review,
  pending,
}: {
  review: StorefrontProductReview;
  pending?: boolean;
}) {
  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div>
          <h5>{review.customerName || "მომხმარებელი"}</h5>
          <div className={styles.reviewMeta}>
            <Stars value={review.rating} />
            {review.isVerifiedPurchase && <span>დადასტურებული შეძენა</span>}
            {pending && <span className={styles.pendingBadge}>მოლოდინში</span>}
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

function ReviewForm({
  productId,
  onSubmitted,
  onCancel,
}: {
  productId: number;
  onSubmitted: (review: StorefrontProductReview, message: string) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill name/email for logged-in users (backend requires customerName).
  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (!active || !user) return;
        setName([user.firstName, user.lastName].filter(Boolean).join(" "));
        if (user.email) setEmail(user.email);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("გთხოვთ, მიუთითოთ სახელი");
      return;
    }
    if (!title.trim()) {
      setError("გთხოვთ, შეავსოთ სათაური");
      return;
    }
    if (!comment.trim()) {
      setError("გთხოვთ, დაწეროთ კომენტარი");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitStorefrontProductReview(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        customerName: name.trim(),
        customerEmail: email.trim() || undefined,
      });
      const optimistic: StorefrontProductReview = {
        id: result.id || Date.now(),
        productId,
        customerName: name.trim(),
        isVerifiedPurchase: false,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSubmitted(
        optimistic,
        result.message ||
          "თქვენი შეფასება გადაიგზავნა და გამოქვეყნდება მოდერაციის შემდეგ."
      );
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      if (status >= 500) {
        // backend EF-save error — most likely a duplicate review for this product
        setError(
          "შეფასების შენახვა ვერ მოხერხდა. შესაძლოა ამ პროდუქტზე უკვე დატოვეთ შეფასება."
        );
      } else {
        setError(
          e instanceof Error ? e.message : "შეფასების დამატება ვერ მოხერხდა"
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.reviewForm}>
      <div className={styles.ratingPicker}>
        {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            type="button"
            className={
              (hover || rating) >= v ? styles.starActive : styles.star
            }
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(v)}
            aria-label={`${v} ვარსკვლავი`}
          >
            ★
          </button>
        ))}
      </div>

      <input
        className={styles.formInput}
        placeholder="სათაური"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={styles.formTextarea}
        placeholder="თქვენი შეფასება პროდუქტზე"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />

      <div className={styles.formRow}>
        <input
          className={styles.formInput}
          placeholder="სახელი"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={styles.formInput}
          placeholder="ელ. ფოსტა (არასავალდებულო)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} disabled={submitting}>
          გაუქმება
        </button>
        <button
          type="button"
          className={styles.formSubmit}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "იგზავნება..." : "გაგზავნა"}
        </button>
      </div>
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [data, setData] = useState<StorefrontProductReviewsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [thanks, setThanks] = useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = useState<StorefrontProductReview[]>(
    []
  );

  const loadReviews = useCallback(() => {
    setLoading(true);
    return getStorefrontProductReviews(productId)
      .then((reviews) => setData(reviews))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

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
        <button type="button" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? "დახურვა" : "შეფასების დამატება"}
        </button>
      </div>

      {thanks && <div className={styles.thanks}>{thanks}</div>}

      {formOpen && (
        <ReviewForm
          productId={productId}
          onCancel={() => setFormOpen(false)}
          onSubmitted={(review, message) => {
            setFormOpen(false);
            setThanks(message);
            setPendingReviews((prev) => [review, ...prev]);
            loadReviews();
          }}
        />
      )}

      {loading ? (
        <AtHomeLoader variant="section" />
      ) : (
        <div className={styles.content}>
          <aside className={styles.summary}>
            <strong>{average.toFixed(1)}</strong>
            <Stars value={average} />
            <span>{totalReviews} შეფასება</span>
          </aside>

          {reviews.length > 0 || pendingReviews.length > 0 ? (
            <div className={styles.reviewsList}>
              {pendingReviews.map((review) => (
                <ReviewCard key={`pending-${review.id}`} review={review} pending />
              ))}
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
