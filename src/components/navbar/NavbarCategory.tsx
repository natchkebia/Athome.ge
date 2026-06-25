"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./NavbarCategory.module.scss";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import {
  getStorefrontCategories,
  StorefrontCategory,
} from "@/lib/api/storefront";

const CATEGORY_ICONS: Record<string, string> = {
  computers: "/icons/Computer-black.svg",
  "computer-parts": "/icons/Computer-parts.svg",
  peripherials: "/icons/Mouse-black.svg",
  "monitors-and-screens": "/icons/Monitor-black.svg",
  "gaming-accessories": "/icons/Headphone.svg",
  "networking-devices": "/icons/Network.svg",
  mobiletablet: "/icons/Phone.svg",
  "usb-and-connectivity": "/icons/Cabels.svg",
  carscooter: "/icons/Moped.svg",
  etechoffice: "/icons/Setting.svg",
  "office-equipment": "/icons/Table-black.svg",
  "tools-and-maintenance": "/icons/broom.svg",
};

const DEFAULT_ICON = "/icons/Setting.svg";

// ლოკალური fallback იკონი (თუ ბექის iconUrl ცარიელია ან ვერ ჩაიტვირთა).
function localCategoryIcon(slug: string) {
  return CATEGORY_ICONS[slug] || DEFAULT_ICON;
}

// ბექის iconUrl-ს ვანიჭებთ პრიორიტეტს, თორემ ლოკალურ იკონს.
function categoryIcon(cat: StorefrontCategory) {
  return cat.iconUrl || localCategoryIcon(cat.slug);
}

export default function NavbarCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    getStorefrontCategories()
      .then((data) => {
        if (!isMounted) return;
        // ვაჩვენებთ ყველა კატეგორიას, რომელსაც პროდუქტი აქვს მიბმული.
        const visible = data.filter((cat) => cat.productCount > 0);
        setCategories(visible);
        if (visible.length > 0) setActiveSlug(visible[0].slug);
      })
      .catch(() => {
        if (isMounted) setCategories([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const activeData = categories.find((c) => c.slug === activeSlug);

  return (
    <div className={styles.navbarCategory} ref={dropdownRef}>
      <div className={styles.header} onClick={toggleDropdown}>
        <img src="/icons/Burger.svg" alt="burger" />
        <span>კატეგორიები</span>
      </div>

      {isOpen && loading && (
        <div className={`${styles.dropdownPanel} ${styles.fullWidth}`}>
          <div className={styles.loaderWrap}>
            <AtHomeLoader variant="section" />
          </div>
        </div>
      )}

      {isOpen && !loading && (
        <div className={`${styles.dropdownPanel} ${styles.fullWidth}`}>
          <div className={styles.leftMenu}>
            {categories.map((cat) => {
              const isActive = activeSlug === cat.slug;
              const hasSubcategories = cat.subCategories.length > 0;

              return (
                <div key={cat.slug} className={styles.menuGroup}>
                  <Link
                    href={`/products/${encodeURIComponent(cat.slug)}`}
                    className={`${styles.menuItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onMouseEnter={() => setActiveSlug(cat.slug)}
                    onClick={closeDropdown}
                  >
                    <div>
                      <img
                        src={categoryIcon(cat)}
                        alt={cat.name}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.dataset.fallback) return;
                          img.dataset.fallback = "1";
                          img.src = localCategoryIcon(cat.slug);
                        }}
                      />
                      <span>{cat.name}</span>
                    </div>

                    {hasSubcategories && (
                      <img
                        className={styles.arrow}
                        src="/icons/Arrow.svg"
                        alt="arrow"
                      />
                    )}
                  </Link>

                  {hasSubcategories && isActive && (
                    <div className={styles.mobileSubMenu}>
                      {cat.subCategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products/${encodeURIComponent(sub.slug)}`}
                          className={styles.subItem}
                          onClick={closeDropdown}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.rightPanel}>
            <div className={styles.subMenu}>
              {activeData?.subCategories?.map((sub) => (
                <div key={sub.slug} className={styles.subGroup}>
                  <Link
                    href={`/products/${encodeURIComponent(sub.slug)}`}
                    className={styles.subItem}
                    onClick={closeDropdown}
                  >
                    {sub.name}
                  </Link>
                  {sub.miniCategories?.length > 0 && (
                    <div className={styles.miniMenu}>
                      {sub.miniCategories.map((mini) => (
                        <Link
                          key={mini.slug}
                          href={`/products/${encodeURIComponent(mini.slug)}`}
                          className={styles.miniItem}
                          onClick={closeDropdown}
                        >
                          {mini.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.mouseIcon}>
              <img src="/icons/Mouse2.svg" alt="mouse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
