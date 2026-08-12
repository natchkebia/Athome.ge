"use client";

import React from "react";
import styles from "./Contact.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export const Contact = () => {
  const locale = useStorefrontLocale();
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <img src="/icons/Main-headphone.svg" alt="headphone" />
        <h2>{locale === "en" ? "Contact us" : "დაგვიკავშირდით"}</h2>
      </div>
      <div className={styles.numbers}>
        <a href="tel:+995322080908">032 2 08 09 08</a>
        <a href="tel:+995599093209">+995 599 09 32 09</a>
      </div>
    </div>
  );
};

export default Contact;
