"use client";

import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import MessengerContactLink from "./MessengerContactLink";
import WhatsAppContactLink from "./WhatsAppContactLink";
import { useContactProduct } from "./ContactProductContext";
import styles from "./FloatingContactButtons.module.scss";

export default function FloatingContactButtons() {
  const locale = useStorefrontLocale();
  const { product } = useContactProduct();
  const whatsappMessage = product
    ? locale === "en"
      ? `Hello, I am interested in this product:\n${product.name}\nSKU: ${product.sku}\n${product.url}`
      : `გამარჯობა, მაინტერესებს ეს პროდუქტი:\n${product.name}\nSKU: ${product.sku}\n${product.url}`
    : undefined;

  return (
    <div className={styles.floatingChats}>
      <WhatsAppContactLink locale={locale} message={whatsappMessage} />
      <MessengerContactLink
        context={
          product ? { type: "product", value: product.sku } : undefined
        }
        locale={locale}
        variant="floating"
        showHours={false}
      />
    </div>
  );
}
