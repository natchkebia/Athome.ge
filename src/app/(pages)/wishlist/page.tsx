"use client";

import { useRouter } from "next/navigation";
import styles from "./Wishlist.module.scss";
import WishlistTab from "@/components/profile/WishlistTab";
import { useCommerce } from "@/contexts/CommerceContext";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function WishlistPage() {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const { wishlist } = useCommerce();

  const handleGoToProducts = () => {
    router.push("/products");
  };
  return (
    <div className={styles.wishlistPage}>
      {wishlist.items.length === 0 ? (
        <>
          <h1 className={styles.title}>{en ? "Wishlist" : "სურვილების სია"}</h1>

          <div className={styles.contentBox}>
            <div>
              <h2 className={styles.subtitle}>{en ? "Your wishlist is empty" : "შენი სურვილების სია ცარიელია"}</h2>
              <p className={styles.text}>
                {en ? "Browse products and save your favorites here" : "დაათვალიერე პროდუქცია და შესაძენად დაამატე სურვილების სიში"}
              </p>
              <img
                src="/icons/wishlist.svg"
                alt="empty wishlist"
                className={styles.image}
              />
            </div>

            <button className={styles.button} onClick={handleGoToProducts}>
              {en ? "Browse products" : "ნახე პროდუქტები"}
            </button>
          </div>
        </>
      ) : (
        <div >
          <WishlistTab variant="page" />
        </div>
      )}
    </div>
  );
}
