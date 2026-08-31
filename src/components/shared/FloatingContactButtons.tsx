"use client";

import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import MessengerContactLink from "./MessengerContactLink";
import WhatsAppContactLink from "./WhatsAppContactLink";
import styles from "./FloatingContactButtons.module.scss";

export default function FloatingContactButtons() {
  const locale = useStorefrontLocale();

  return (
    <div className={styles.floatingChats}>
      <WhatsAppContactLink locale={locale} />
      <MessengerContactLink
        locale={locale}
        variant="floating"
        showHours={false}
      />
    </div>
  );
}
