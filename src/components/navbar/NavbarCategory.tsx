"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./NavbarCategory.module.scss";

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

export default function NavbarCategory() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowSubmenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setShowSubmenu(false);
  };

  const handleCategoryClick = (catId: number, hasSubs: boolean) => {
    if (hasSubs) {
      if (activeCategory === catId && showSubmenu) {
        setShowSubmenu(false);
      } else {
        setActiveCategory(catId);
        setShowSubmenu(true);
      }
    } else {
      setActiveCategory(catId);
      setShowSubmenu(false);
    }
  };

  return (
    <div className={styles.navbarCategory} ref={dropdownRef}>
      <div className={styles.header} onClick={toggleDropdown}>
        <img src="/icons/Burger.svg" alt="burger" />
        <span>კატეგორიები</span>
      </div>

      {isOpen && (
        <div
          className={`${styles.dropdownPanel} ${
            showSubmenu ? styles.fullWidth : styles.smallWidth
          }`}
        >
          {/* მარცხენა მენიუ */}
          <div className={styles.leftMenu}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`${styles.menuItem} ${
                  activeCategory === cat.id ? styles.active : ""
                }`}
                onClick={() =>
                  handleCategoryClick(cat.id, cat.subcategories.length > 0)
                }
              >
                <div>
                  <img src={cat.icon} alt={cat.title} />
                  <span>{cat.title}</span>
                </div>

                {cat.subcategories.length > 0 && (
                  <img
                    className={styles.arrow}
                    src="/icons/Arrow.svg"
                    alt="arrow"
                  />
                )}
              </div>
            ))}
          </div>

          {/* მარჯვენა ქვე-მენიუ */}
          {showSubmenu && activeCategory !== null && (
            <div className={styles.rightPanel}>
              {categories
                .filter((c) => c.id === activeCategory)
                .map((c) => (
                  <div key={c.id} className={styles.subMenu}>
                    {c.subcategories.map((sub) => (
                      <div key={sub} className={styles.subItem}>
                        {sub}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
