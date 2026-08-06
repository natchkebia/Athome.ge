"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ProductSortBar.module.scss";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface ProductSortBarProps {
  filters: {
    sort: string;
  };
  onChange: (values: Partial<ProductSortBarProps["filters"]>) => void;
}

export default function ProductSortBar({
  filters,
  onChange,
}: ProductSortBarProps) {
  const en = useStorefrontLocale() === "en";
  const sortOptions = [
    { value: "default", label: en ? "All" : "ყველა" },
    { value: "price-asc", label: en ? "Newest" : "უახლესი" },
    { value: "price-desc", label: en ? "Best selling" : "გაყიდვადი" },
    { value: "a-z", label: "A-Z" },
    { value: "z-a", label: "Z-A" },
  ];

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    onChange({ sort: value });
    setOpen(false);
  };

  const activeLabel =
    sortOptions.find((o) => o.value === filters.sort)?.label || (en ? "Sort" : "დალაგება");

  return (
    <div className={styles.controls} ref={dropdownRef}>
      <button
        className={styles.dropBtn}
        onClick={() => setOpen((prev) => !prev)}
      >
        {activeLabel}
        {open ? (
          <img src="/icons/Arrow-up.svg" alt="Arrow-up"/>
        ) : (
          <img src="/icons/Arrow-down.svg" alt="Arrow-down" className={styles.firstButton}/>
        )}
      </button>

      {open && (
        <div className={styles.menu}>
          {sortOptions.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.option} ${
                filters.sort === opt.value ? styles.active : ""
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
