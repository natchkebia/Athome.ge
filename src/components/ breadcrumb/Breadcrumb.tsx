"use client";

import { useRouter } from "next/navigation";
import styles from "./Breadcrumb.module.scss";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

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
            {item.label}
          </span>

          {index < items.length - 1 && (
            <img src="./icons/Arrow.svg" alt="" />
          )}
        </span>
      ))}
    </div>
  );
}
