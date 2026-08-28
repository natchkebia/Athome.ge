"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import NavbarCategory, { categoryIcon, localCategoryIcon } from "./NavbarCategory";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { getStorefrontCategories, type StorefrontCategory } from "@/lib/api/storefront";

export default function Navbar() {
  const pathname = usePathname();
  const locale = useStorefrontLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileCategories, setMobileCategories] = useState<StorefrontCategory[]>([]);
  const [activeMobileCategory, setActiveMobileCategory] = useState<StorefrontCategory | null>(null);

  useEffect(() => {
    let active = true;
    getStorefrontCategories()
      .then((data) => {
        if (active) {
          setMobileCategories(data.filter((category) => category.productCount > 0));
        }
      })
      .catch(() => {
        if (active) setMobileCategories([]);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMobileCategory(null);
  }, [pathname]);

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setActiveMobileCategory(null);
  };

  const menuItems = locale === "en"
    ? [
        { title: "Configurator", href: "/configurator" },
        { title: "Discounts", href: "/discounts" },
        { title: "Delivery", href: "/delivery-info" },
        { title: "News", href: "/news" },
        { title: "Service", href: "/services" },
        { title: "Contact", href: "/contact" },
      ]
    : [
        { title: "კონფიგურატორი", href: "/configurator" },
        { title: "ფასდაკლებები", href: "/discounts" },
        { title: "მიწოდება", href: "/delivery-info" },
        { title: "სიახლეები", href: "/news" },
        { title: "სერვისი", href: "/services" },
        { title: "კონტაქტი", href: "/contact" },
      ];

  return (
    <nav className={styles.navbar}>
      <div>
        <NavbarCategory />

        <button
          type="button"
          className={`${styles.mobileMenuButton} ${
            isMenuOpen ? styles.openButton : ""
          }`}
          onClick={() => {
            setIsMenuOpen((prev) => !prev);
            if (isMenuOpen) setActiveMobileCategory(null);
          }}
          aria-label={locale === "en" ? "Open menu" : "მენიუს გახსნა"}
          aria-expanded={isMenuOpen}
        >
          <img src="/icons/Burger.svg" alt="" />
        </button>

        <ul
          className={`${styles.menuList} ${isMenuOpen ? styles.openMenu : ""}`}
        >
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className={styles.menuItem}>
                <Link
                  href={item.href}
                  className={`${styles.menuLink} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>

        {isMenuOpen && (
          <section
            className={`${styles.mobileCatalog} ${
              activeMobileCategory ? styles.mobileSubcatalog : ""
            }`}
            aria-label={locale === "en" ? "Categories" : "კატეგორიები"}
          >
            <div className={styles.mobileCatalogHeader}>
              {activeMobileCategory ? (
                <button type="button" onClick={() => setActiveMobileCategory(null)} aria-label={locale === "en" ? "Back" : "უკან"}>
                  <span className={styles.backArrow}>‹</span>
                  <span>{activeMobileCategory.name}</span>
                </button>
              ) : (
                <strong>{locale === "en" ? "Categories" : "კატეგორიები"}</strong>
              )}
              {!activeMobileCategory && (
                <button type="button" className={styles.closeCatalog} onClick={closeMobileMenu} aria-label={locale === "en" ? "Close" : "დახურვა"}>
                  <img src="/icons/Frame 5197.svg" alt="" />
                </button>
              )}
            </div>

            {activeMobileCategory ? (
              <div className={styles.mobileSubcategoryGrid}>
                {activeMobileCategory.subCategories.map((sub) => (
                  <Link key={sub.slug} href={`/products/${encodeURIComponent(sub.slug)}`} onClick={closeMobileMenu}>
                    {sub.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.mobileCategoryList}>
                {mobileCategories.map((category) => {
                  const opensSubcategoryPage = category.subCategories.length > 0;
                  return opensSubcategoryPage ? (
                    <button key={category.slug} type="button" onClick={() => setActiveMobileCategory(category)}>
                      <span className={styles.categoryIdentity}>
                        <img src={categoryIcon(category)} alt="" onError={(event) => { event.currentTarget.src = localCategoryIcon(category.slug); }} />
                        <span>{category.name}</span>
                      </span>
                      <span className={styles.categoryArrow}>›</span>
                    </button>
                  ) : (
                    <Link key={category.slug} href={`/products/${encodeURIComponent(category.slug)}`} onClick={closeMobileMenu}>
                      <span className={styles.categoryIdentity}>
                        <img src={categoryIcon(category)} alt="" onError={(event) => { event.currentTarget.src = localCategoryIcon(category.slug); }} />
                        <span>{category.name}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </nav>
  );
}
