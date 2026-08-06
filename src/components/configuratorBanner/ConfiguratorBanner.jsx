"use client";

import Link from "next/link";
import styles from "./ConfiguratorBanner.module.css";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function ConfiguratorBanner() {
  const locale = useStorefrontLocale();
  return (
    <section className={styles.configuratorSection}>
      <Link href="/configurator" className={styles.banner}>
        <div className={styles.vectorCircle}></div>
        <div className={styles.vectorDots}></div>
        <div className={styles.vectorDotsRight}></div>
        <div className={styles.waveOne}></div>
        <div className={styles.waveTwo}></div>
        <span className={styles.squareOne}></span>
        <span className={styles.squareTwo}></span>
        <span className={styles.circleSmall}></span>

        <div className={styles.imageSide}>
          <img
            src="/images/configurator-parts.png"
            alt={locale === "en" ? "PC configurator" : "კომპიუტერის კონფიგურატორი"}
          />
        </div>

        <div className={styles.contentSide}>
          <h2>{locale === "en" ? "Build your dream computer virtually with our configurator" : "ააწყვე შენი ოცნების კომპიუტერი ვირტუალურად კონფიგურატორის დახმარებით"}</h2>
          <p>{locale === "en" ? "Your system unit will be assembled within 24 hours of ordering." : "სისტემური ბლოკი იწყობა შეკვეთიდან 24 საათში."}</p>
          <span className={styles.button}>{locale === "en" ? "Start building" : "დაიწყე აწყობა"}</span>
        </div>
      </Link>
    </section>
  );
}
