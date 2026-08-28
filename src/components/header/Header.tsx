"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BasketPage from "../Basket/Basket";
import SearchBar from "../searchBar/SearchBar";
import SignIn from "../signIn/SignIn";
import WishlistPage from "../wishlist/WishlistPage";
import styles from "./Header.module.scss";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(pathname === "/search");

  useEffect(() => {
    setIsMobileSearchOpen(pathname === "/search");
  }, [pathname]);

  return (
    <div className={`${styles.container} ${isMobileSearchOpen ? styles.searchOpen : ""}`}>
      <div className="site-wrapper">
        <Link href="/" aria-label="მთავარ გვერდზე დაბრუნება">
          <img
            src="/icons/Logo.svg"
            alt="Ethome Logo"
            className="header-logo"
          />
        </Link>
        <button
          type="button"
          className={styles.mobileSearch}
          aria-label={isMobileSearchOpen ? "ძებნის დახურვა" : "ძებნის გახსნა"}
          aria-expanded={isMobileSearchOpen}
          onClick={() => setIsMobileSearchOpen((open) => !open)}
        >
          <img src="/icons/Frame-163477.svg" alt="" />
        </button>
        <div className={styles.searchArea}>
          <SearchBar />
        </div>
        <div className={styles.wrapper}>
          <SignIn />
          <WishlistPage />
          <BasketPage />
        </div>
      </div>
    </div>
  );
}
