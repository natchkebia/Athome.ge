"use client";

import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import MessengerContactLink from "./MessengerContactLink";
import WhatsAppContactLink from "./WhatsAppContactLink";
import { useContactProduct } from "./ContactProductContext";
import styles from "./FloatingContactButtons.module.scss";

export default function FloatingContactButtons() {
  const locale = useStorefrontLocale();
  const { productSku } = useContactProduct();
  const whatsappMessage = productSku
    ? locale === "en"
      ? `Hello, I am interested in this product. SKU: ${productSku}`
      : `გამარჯობა, მაინტერესებს ეს პროდუქტი. SKU: ${productSku}`
    : undefined;

  return (
    <div className={styles.floatingChats}>
      <WhatsAppContactLink locale={locale} message={whatsappMessage} />
      <MessengerContactLink
        context={
          productSku ? { type: "product", value: productSku } : undefined
        }
        locale={locale}
        variant="floating"
        showHours={false}
      />
    </div>
  );
}
