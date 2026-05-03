"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.scss";
import NavbarCategory from "./NavbarCategory";

export default function Navbar() {
  const pathname = usePathname();

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

        <ul className={styles.menuList}>
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