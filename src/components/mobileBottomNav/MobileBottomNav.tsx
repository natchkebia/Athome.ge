"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommerce } from "@/contexts/CommerceContext";
import styles from "./MobileBottomNav.module.scss";

const items = [
  { href: "/", icon: "/icons/mobile-home.svg", label: "მთავარი" },
  { href: "/basket", icon: "/icons/mobile-cart.svg", label: "კალათა", badge: "cart" },
  { href: "/discounts", icon: "/icons/mobile-sale.svg", label: "აქციები", visibleLabel: true },
  { href: "/wishlist", icon: "/icons/mobile-heart.svg", label: "სურვილები", badge: "wishlist" },
  { href: "/profile", icon: "/icons/mobile-profile.svg", label: "პროფილი" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, wishlist } = useCommerce();

  return (
    <nav className={styles.nav} aria-label="მობილური ნავიგაცია">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const badgeType = "badge" in item ? item.badge : undefined;
        const count = badgeType === "cart" ? cart.totalItems : badgeType === "wishlist" ? wishlist.totalItems : 0;
        const targetId = badgeType === "cart" ? "mobile-nav-cart-icon" : badgeType === "wishlist" ? "mobile-nav-wishlist-icon" : undefined;

        return (
          <Link key={item.href} href={item.href} className={`${styles.item} ${active ? styles.active : ""}`} aria-label={item.label}>
            <span className={styles.iconWrap} id={targetId}>
              <img src={item.icon} alt="" />
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </span>
            {"visibleLabel" in item && item.visibleLabel && <span className={styles.label}>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
