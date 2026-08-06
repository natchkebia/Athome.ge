"use client";

import { useRouter } from "next/navigation";
import styles from "./Breadcrumb.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

const EN_LABELS: Record<string, string> = {
  "მთავარი გვერდი": "Home",
  კონფიგურატორი: "Configurator",
  ფასდაკლებები: "Discounts",
  მიწოდება: "Delivery",
  "მიწოდების დეტალები": "Delivery details",
  სიახლეები: "News",
  სერვისი: "Service",
  კონტაქტი: "Contact",
  შედარება: "Comparison",
  ბრენდები: "Brands",
  ძებნა: "Search",
  "პერსონალური ინფორმაცია": "Personal information",
  "ჩემი შეკვეთები": "My orders",
  "ჩემი კალათა": "My cart",
  "სურვილების სია": "Wishlist",
  "შენახული სისტემები": "Saved configurations",
  გასვლა: "Sign out",
};

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();
  const en = useStorefrontLocale() === "en";

  const handleClick = (href?: string) => {
    if (href) router.push(href);
  };

  return (
    <div className={styles.breadcrumb}>
      {items.map((item, index) => (
        <span key={index} className={styles.crumb}>
          <span
            className={`${styles.label} ${item.href ? styles.link : ""}`}
            onClick={() => handleClick(item.href)}
          >
            {en ? EN_LABELS[item.label] ?? item.label : item.label}
          </span>

          {index < items.length - 1 && (
            <img src="/icons/Arrow.svg" alt="" />
          )}
        </span>
      ))}
    </div>
  );
}
