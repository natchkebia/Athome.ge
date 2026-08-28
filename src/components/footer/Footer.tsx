"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import {
  getStorefrontCategories,
  type StorefrontCategory,
} from "@/lib/api/storefront";
import MessengerContactLink from "../shared/MessengerContactLink";

const categoryFallback = [
  { slug: "computers", ka: "კომპიუტერები", en: "Computers" },
  { slug: "computer-parts", ka: "კომპიუტერის ნაწილები", en: "Computer parts" },
  { slug: "laptops", ka: "ნოუთბუქები", en: "Laptops" },
  { slug: "monitors-and-screens", ka: "მონიტორები", en: "Monitors" },
  { slug: "laptop-bags", ka: "ნოუთბუქის ჩანთები", en: "Laptop bags" },
  { slug: "cables-and-adapters", ka: "კაბელები და ადაპტერები", en: "Cables and adapters" },
];

const serviceLinks = [
  { href: "/configurator", ka: "კონფიგურატორი", en: "Configurator" },
  { href: "/discounts", ka: "ფასდაკლებები", en: "Discounts" },
  { href: "/delivery-info", ka: "მიწოდება", en: "Delivery" },
  { href: "/news", ka: "სიახლეები", en: "News" },
  { href: "/services", ka: "სერვისი", en: "Service" },
  { href: "/contact", ka: "კონტაქტი", en: "Contact" },
];

export default function Footer() {
  const locale = useStorefrontLocale();
  const en = locale === "en";
  const [footerCategories, setFooterCategories] = useState<StorefrontCategory[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getStorefrontCategories()
      .then((categories) => {
        if (!active) return;
        setFooterCategories(categories.filter((category) => category.productCount > 0).slice(0, 6));
      })
      .catch(() => {
        if (active) setFooterCategories([]);
      });

    return () => {
      active = false;
    };
  }, [locale]);
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles["footer-left"]}>
          <div className={styles["footer-logo"]}>
            <img src="/icons/Logo.svg" alt="Logo" />
          </div>

          <ul className={styles["contact-list"]}>
            <li>
              <img src="/icons/footerPhone.svg" alt="Phone" />
              <div className={styles["phone-numbers"]}>
                <a href="tel:+995322080908">032 2 08 09 08</a>
                <a href="tel:+995599093209">+995 599 09 32 09</a>
              </div>
            </li>
            <li>
              <img src="/icons/footerMeil.svg" alt="Email" />
              <span>info@athome.ge</span>
            </li>
            <li>
              <img src="/icons/footerLocation.svg" alt="Location" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98%20%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90%E1%83%91%20%E1%83%99%E1%83%9D%E1%83%A1%E1%83%A2%E1%83%90%E1%83%95%E1%83%90%E1%83%A1%2073"
                target="_blank"
                rel="noopener noreferrer"
              >
                {en ? "73 Merab Kostava St, Tbilisi" : "თბილისი, მერაბ კოსტავას ქუჩა #73"}
              </a>
            </li>
            <li>
              <img src="/icons/footerLocation.svg" alt="Location" />
              <a
                href="https://www.google.com/maps/search/?api=1&query=%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98%20%E1%83%90%E1%83%99%E1%83%90%E1%83%99%E1%83%98%20%E1%83%AC%E1%83%94%E1%83%A0%E1%83%94%E1%83%97%E1%83%9A%E1%83%98%E1%83%A1%20%E1%83%92%E1%83%90%E1%83%9B%E1%83%96%E1%83%98%E1%83%A0%E1%83%98%20115"
                target="_blank"
                rel="noopener noreferrer"
              >
                {en ? "115 Akaki Tsereteli Ave, Tbilisi" : "თბილისი, აკაკი წერეთლის გამზირი #115"}
              </a>
            </li>
          </ul>

          <div className={styles.socials}>
            <a
              href="https://www.facebook.com/athomege/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img src="/icons/footerFacebook.svg" alt="Facebook" />
            </a>
            <a
              href="https://www.instagram.com/athome_ge/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src="/icons/footerInstagram.svg" alt="Instagram" />
            </a>
            <a
              href="https://www.youtube.com/@athshop"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <img src="/icons/footerYoutube.svg" alt="YouTube" />
            </a>
          </div>
        </div>

        {/* მენიუები */}
        <div className={styles["footer-menus"]}>
          <div className={`${styles["menu-column"]} ${openMenu === 0 ? styles.open : ""}`}>
            <button className={styles["menu-toggle"]} onClick={() => setOpenMenu(openMenu === 0 ? null : 0)} aria-expanded={openMenu === 0}>
              <span>{en ? "Services" : "სერვისები"}</span>
              <img src="/icons/language-chevron-large.svg" alt="" />
            </button>
            <h4>{en ? "Services" : "სერვისები"}</h4>
            <ul>
              {serviceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{en ? item.en : item.ka}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles["menu-column"]} ${openMenu === 1 ? styles.open : ""}`}>
            <button className={styles["menu-toggle"]} onClick={() => setOpenMenu(openMenu === 1 ? null : 1)} aria-expanded={openMenu === 1}>
              <span>{en ? "Categories" : "კატეგორიები"}</span>
              <img src="/icons/language-chevron-large.svg" alt="" />
            </button>
            <h4>{en ? "Categories" : "კატეგორიები"}</h4>
            <ul>
              {footerCategories.length > 0
                ? footerCategories.map((category) => (
                    <li key={category.slug}>
                      <Link href={`/products/${category.slug}`}>{category.name}</Link>
                    </li>
                  ))
                : categoryFallback.map((category) => (
                    <li key={category.slug}>
                      <Link href={`/products/${category.slug}`}>
                        {en ? category.en : category.ka}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>

          <div className={`${styles["menu-column"]} ${openMenu === 2 ? styles.open : ""}`}>
            <button className={styles["menu-toggle"]} onClick={() => setOpenMenu(openMenu === 2 ? null : 2)} aria-expanded={openMenu === 2}>
              <span>{en ? "About us" : "ჩვენ შესახებ"}</span>
              <img src="/icons/language-chevron-large.svg" alt="" />
            </button>
            <h4>{en ? "About us" : "ჩვენ შესახებ"}</h4>
            <ul>
              <li><Link href="/about-us">{en ? "Who we are" : "ვინ ვართ ჩვენ"}</Link></li>
            </ul>
          </div>

          <div className={`${styles["menu-column"]} ${openMenu === 3 ? styles.open : ""}`}>
            <button className={styles["menu-toggle"]} onClick={() => setOpenMenu(openMenu === 3 ? null : 3)} aria-expanded={openMenu === 3}>
              <span>{en ? "Terms and conditions" : "წესები და პირობები"}</span>
              <img src="/icons/language-chevron-large.svg" alt="" />
            </button>
            <h4>{en ? "Terms and conditions" : "წესები და პირობები"}</h4>
            <ul>
              <li><Link href="/terms-and-conditions">{en ? "Terms and conditions" : "წესები და პირობები"}</Link></li>
              <li><Link href="/return-policy">{en ? "Return policy" : "დაბრუნების პოლიტიკა"}</Link></li>
              <li><Link href="/delivery-info">{en ? "Delivery" : "მიწოდება"}</Link></li>
              <li><Link href="/privacy-policy">{en ? "Privacy policy" : "კონფიდენციალურობის პოლიტიკა"}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles["footer-bottom"]}>
        <p>{en ? "Terms of service © 2025 athome.ge. All rights reserved" : "სერვისის პირობები © 2025 athome.ge. ყველა უფლება დაცულია"}</p>
      </div>

      <div className={styles.floatingChats}>
        <MessengerContactLink
          locale={en ? "en" : "ka"}
          variant="floating"
          showHours={false}
        />
      </div>
    </footer>
  );
}
