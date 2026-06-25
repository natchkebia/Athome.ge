"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Slider.module.scss";
import {
  getStorefrontBanners,
  StorefrontBanner,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";

type Slide = {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  ctaLabel?: string;
};

type SliderProps = {
  banners?: StorefrontBanner[];
};

export default function Slider({ banners: providedBanners }: SliderProps) {
  const router = useRouter();
  const [fetchedBanners, setFetchedBanners] = useState<StorefrontBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (providedBanners) return;

    let isMounted = true;

    getStorefrontBanners("hero")
      .then((items) => {
        if (!isMounted) return;

        setFetchedBanners([...items].sort((a, b) => a.sortOrder - b.sortOrder));
        setCurrentIndex(0);
      })
      .catch(() => {
        if (isMounted) setFetchedBanners([]);
      });

    return () => {
      isMounted = false;
    };
  }, [providedBanners]);

  const banners = providedBanners ?? fetchedBanners;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 560px)");

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  const slides = useMemo(
    (): Slide[] =>
      banners
        .map((banner) => ({
          id: banner.id,
          image:
            isMobile && banner.mobileImageUrl
              ? normalizeMediaUrl(banner.mobileImageUrl, "")
              : normalizeMediaUrl(banner.imageUrl, ""),
          title: banner.title,
          subtitle: banner.subtitle,
          linkUrl: banner.linkUrl,
          ctaLabel: banner.ctaLabel,
        }))
        .filter((slide) => slide.image),
    [banners, isMobile]
  );

  // ავტომატური ცვლა — ყოველ 5 წამში შემდეგი სლაიდი (ხელით ცვლა აზუსტებს ტაიმერს).
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [currentIndex, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex] ?? slides[0];

  // ფოტოზე დაჭერა — ბანერის ინდივიდუალურ ლინკზე გადასვლა (ბექიდან).
  const handleSlideClick = () => {
    const url = currentSlide.linkUrl;
    if (!url) return;

    if (/^https?:\/\//i.test(url)) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  // ისრებზე დაჭერა მხოლოდ სლაიდს ცვლის (ფოტოს ლინკზე არ გადადის).
  const handleArrow = (event: React.MouseEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };

  return (
    <div
      className={styles.sliderContainer}
      style={{
        backgroundImage: `url(${currentSlide.image})`,
        cursor: currentSlide.linkUrl ? "pointer" : "default",
      }}
      onClick={handleSlideClick}
      role={currentSlide.linkUrl ? "link" : undefined}
      aria-label={currentSlide.linkUrl ? currentSlide.title : undefined}
    >
      <div className={styles.overlay}>
        <div className={styles.rightControls}>
          <div className={styles.range}>
            <span>{String(currentIndex + 1).padStart(2, "0")}</span>
            <div className={styles.line}>
              <div
                className={styles.progress}
                style={{
                  height: `${((currentIndex + 1) / slides.length) * 100}%`,
                }}
              />
            </div>
            <span> {String(slides.length).padStart(2, "0")}</span>
          </div>

          <div className={styles.controls}>
            <button
              onClick={(e) => handleArrow(e, handlePrev)}
              className={styles.arrow}
            >
              <img src="/icons/Arrow-left.svg" alt="arrow-left" />
            </button>
            <button
              onClick={(e) => handleArrow(e, handleNext)}
              className={styles.arrow}
            >
              <img src="/icons/Arrow-right.svg" alt="arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
