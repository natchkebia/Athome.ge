"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./NavbarCategory.module.scss";

export default function NavbarCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCategoryClick = (id: number) => {
    setActiveCategory(id);
  };

  const activeData = categories.find((c) => c.id === activeCategory);

  return (
    <div className={styles.navbarCategory} ref={dropdownRef}>
      <div className={styles.header} onClick={toggleDropdown}>
        <img src="/icons/Burger.svg" alt="burger" />
        <span>კატეგორიები</span>
      </div>

      {isOpen && (
        <div className={`${styles.dropdownPanel} ${styles.fullWidth}`}>
          <div className={styles.leftMenu}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const hasSubcategories = cat.subcategories.length > 0;

              return (
                <div key={cat.id} className={styles.menuGroup}>
                  <button
                    type="button"
                    className={`${styles.menuItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <div>
                      <img src={cat.icon} alt={cat.title} />
                      <span>{cat.title}</span>
                    </div>

                    {hasSubcategories && (
                      <img
                        className={styles.arrow}
                        src="/icons/Arrow.svg"
                        alt="arrow"
                      />
                    )}
                  </button>

                  {hasSubcategories && isActive && (
                    <div className={styles.mobileSubMenu}>
                      {cat.subcategories.map((sub) => (
                        <div key={sub} className={styles.subItem}>
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.rightPanel}>
            <div className={styles.subMenu}>
              {activeData?.subcategories?.map((sub) => (
                <div key={sub} className={styles.subItem}>
                  {sub}
                </div>
              ))}
            </div>
            <div className={styles.mouseIcon}>
              <img src="/icons/Mouse2.svg" alt="mouse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const categories = [
  {
    id: 1,
    icon: "/icons/Computer-black.svg",
    title: "კომპიუტერები",
    subcategories: ["ლეპტოპები", "მაგიდის კომპიუტერები", "გეიმინგი"],
  },
  {
    id: 2,
    icon: "/icons/Computer-parts.svg",
    title: "კომპიუტერის ნაწილები",
    subcategories: ["მეხსიერება", "ვიდეობარათი", "პროცესორი", "დედა დაფა"],
  },
  {
    id: 3,
    icon: "/icons/Mouse-black.svg",
    title: "პერიფერალები",
    subcategories: ["მაუსები", "კლავიატურები", "მონიტორის სტენდები"],
  },
  {
    id: 4,
    icon: "/icons/Headphone.svg",
    title: "კომპიუტერის აქსესუარები",
    subcategories: ["ყურსასმენები", "მიკროფონები", "სპიკერები"],
  },
  {
    id: 5,
    icon: "/icons/Monitor-black.svg",
    title: "მონიტორები",
    subcategories: [],
  },
  {
    id: 6,
    icon: "/icons/Tv.svg",
    title: "ტელევიზორები",
    subcategories: [],
  },
  {
    id: 7,
    icon: "/icons/Projector.svg",
    title: "პროექტორები",
    subcategories: [],
  },
  {
    id: 8,
    icon: "/icons/Table-black.svg",
    title: "სავარძლები და მაგიდები",
    subcategories: [],
  },
  {
    id: 9,
    icon: "/icons/Laptop.svg",
    title: "ნოუთბუქები",
    subcategories: [],
  },
  {
    id: 10,
    icon: "/icons/LaptopParts.svg",
    title: "ნოუთბუქის ნაწილები",
    subcategories: [],
  },
  {
    id: 11,
    icon: "/icons/LaptopAccessories.svg",
    title: "ნოუთბუქის აქსესუარები",
    subcategories: [],
  },
  {
    id: 12,
    icon: "/icons/Cabels.svg",
    title: "კაბელები და ადაპტერები",
    subcategories: ["სმარტფონის კაბელები", "დამტენები", "USB ჰაბები"],
  },
  {
    id: 13,
    icon: "/icons/Phone.svg",
    title: "მობილურის აქსესუარები",
    subcategories: [],
  },
  {
    id: 14,
    icon: "/icons/Network.svg",
    title: "ქსელის აპარატურა",
    subcategories: ["რუტერები", "მოდემები", "ქსელის კაბელები"],
  },
];
