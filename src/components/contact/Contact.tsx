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
      <span>+995 599 09 32 09</span>
    </div>
  );
};

export default Contact;
