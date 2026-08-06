"use client";

import Link from "next/link";
import styles from "./Service.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

type ServiceItem = {
  icon: string;
  alt: string;
  title: string;
  subtitle: string;
  // href გარეშე ბლოკი ჯერ არ არის დასაჭერი (გვერდი მალე დაემატება).
  href?: string;
};

const items: ServiceItem[] = [
  {
    icon: "/icons/Moped.svg",
    alt: "Moped",
    title: "მიწოდება",
    subtitle: "საქართველოს მასშტაბით",
    href: "/delivery-info",
  },
  {
    icon: "/icons/Check.svg",
    alt: "Check",
    title: "გარანტია",
    subtitle: "სუკან დაბრუნების პოლიტიკა",
  },
  {
    icon: "/icons/Setting.svg",
    alt: "Setting",
    title: "სერვისი",
    subtitle: "შეკეთება და მომსახერება",
    href: "/services",
  },
  {
    icon: "/icons/Talking-man.svg",
    alt: "Talking-man",
    title: "მომსახურება",
    subtitle: "კორპორატიული გაყიდვები",
  },
];

const Service = () => {
  const locale = useStorefrontLocale();
  const englishItems: ServiceItem[] = [
    { icon: "/icons/Moped.svg", alt: "Moped", title: "Delivery", subtitle: "Throughout Georgia", href: "/delivery-info" },
    { icon: "/icons/Check.svg", alt: "Check", title: "Warranty", subtitle: "Return policy" },
    { icon: "/icons/Setting.svg", alt: "Setting", title: "Service", subtitle: "Repair and maintenance", href: "/services" },
    { icon: "/icons/Talking-man.svg", alt: "Talking-man", title: "Support", subtitle: "Corporate sales" },
  ];
  const visibleItems = locale === "en" ? englishItems : items;
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {visibleItems.map((item) => {
          const content = (
            <>
              <div className={styles.iconCircle}>
                <img src={item.icon} alt={item.alt} />
              </div>
              <h3>{item.title}</h3>
              <span>{item.subtitle}</span>
            </>
          );

          return item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className={`${styles.item} ${styles.clickable}`}
            >
              {content}
            </Link>
          ) : (
            <div key={item.title} className={styles.item}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Service;
