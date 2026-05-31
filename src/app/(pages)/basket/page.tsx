"use client";

import styles from "./basket.module.scss";
import CartTab from "@/components/profile/CartTab";
import { useRouter } from "next/navigation";
import CartSummary from "@/components/profile/CartSummary";
import { useCommerce } from "@/contexts/CommerceContext";

export default function BasketFullPage() {
  const router = useRouter();
  const { cart } = useCommerce();

  const handleGoToProducts = () => {
    router.push("/");
  };

  return (
    <div className={styles.basketPage}>
      {cart.items.length === 0 ? (
        <>
          <h1 className={styles.title}>კალათა</h1>

          <div className={styles.contentBox}>
            <div>
              <h2 className={styles.subtitle}>შენი კალათა ცარიელია</h2>

              <p className={styles.text}>
                დაამატე პროდუქტები და შეამოწმე აქ შენი კალათის შიგთავსი
              </p>

              <img
                src="/icons/Basket.svg"
                alt="empty basket"
                className={styles.image}
              />
            </div>

            <button className={styles.button} onClick={handleGoToProducts}>
              გადადი პროდუქტებზე
            </button>
          </div>
        </>
      ) : (
        <div className={styles.cartwrapper}>
          <div className={styles.cartContainer}>
            <CartTab showSummary={false} />
          </div>

          <CartSummary showItems={false} />
        </div>
      )}
    </div>
  );
}
