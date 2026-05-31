"use client";

import { useRouter } from "next/navigation";
import styles from "./Wishlist.module.scss";
import WishlistTab from "@/components/profile/WishlistTab";
import { useCommerce } from "@/contexts/CommerceContext";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist } = useCommerce();

  const handleGoToProducts = () => {
    router.push("/products");
  };
  return (
    <div className={styles.wishlistPage}>
      {wishlist.items.length === 0 ? (
        <>
          <h1 className={styles.title}>სურვილების სია</h1>

          <div className={styles.contentBox}>
            <div>
              <h2 className={styles.subtitle}>შენი სურვილების სია ცარიელია</h2>
              <p className={styles.text}>
                დაათვალიერე პროდუქცია და შესაძენად დაამატე სურვილების სიში
              </p>
              <img
                src="/icons/wishlist.svg"
                alt="empty wishlist"
                className={styles.image}
              />
            </div>

            <button className={styles.button} onClick={handleGoToProducts}>
              ნახე პროდუქტები
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
