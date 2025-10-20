"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./LanguageDropdown.module.scss";

const languages = [
  { code: "ka", label: "ქარ", flag: "/icons/Geo.svg" },
  { code: "en", label: "ENG", flag: "/icons/Uk.svg" },
];

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);

  const toggleDropdown = () => setOpen(!open);

  const handleSelect = (lang: (typeof languages)[0]) => {
    setSelected(lang);
    setOpen(false);
  };

  const availableLanguages = languages.filter(
    (lang) => lang.code !== selected.code
  );

  return (
    <div className={styles.dropdown}>
      <button className={styles.button} onClick={toggleDropdown}>
        <Image src={selected.flag} alt="flag" width={24} height={24} />
        <div className={styles.content}>
          <span>{selected.label}</span>
          <Image
            src={open ? "/icons/Arrow-up.svg" : "/icons/Arrow-down.svg"}
            alt="arrow"
            width={14}
            height={14}
            className={styles.arrow}
          />
        </div>
      </button>

      {open && (
        <div className={styles.menu}>
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={styles.menuItem}
              onClick={() => handleSelect(lang)}
            >
              <Image src={lang.flag} alt={lang.label} width={24} height={24} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
