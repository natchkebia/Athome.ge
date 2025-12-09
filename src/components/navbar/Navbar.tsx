"use client";

import { useState } from "react";
import styles from "./Navbar.module.scss";
import NavbarCategory from "./NavbarCategory";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    "კონფიგურატორი",
    "ფასდაკლებები",
    "მიწოდება",
    "სიახლეები",
    "სერვისი",
    "კონტაქტი",
  ];

  return (
    <nav className={styles.navbar}>
      <div>
        <NavbarCategory />
        <ul className={styles.menuList}>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
