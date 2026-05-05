"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import NavbarCategory from "./NavbarCategory";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { title: "კონფიგურატორი", href: "/configurator" },
    { title: "ფასდაკლებები", href: "/discounts" },
    { title: "მიწოდება", href: "/delivery-info" },
    { title: "სიახლეები", href: "/news" },
    { title: "სერვისი", href: "/services" },
    { title: "კონტაქტი", href: "/contact" },
  ];

  return (
    <nav className={styles.navbar}>
      <div>
        <NavbarCategory />

        <button
          type="button"
          className={`${styles.mobileMenuButton} ${
            isMenuOpen ? styles.openButton : ""
          }`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="მენიუს გახსნა"
          aria-expanded={isMenuOpen}
        >
          <img src="/icons/Burger.svg" alt="" />
        </button>

        <ul
          className={`${styles.menuList} ${isMenuOpen ? styles.openMenu : ""}`}
        >
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className={styles.menuItem}>
                <Link
                  href={item.href}
                  className={`${styles.menuLink} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
