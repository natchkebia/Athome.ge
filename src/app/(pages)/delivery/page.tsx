import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import styles from "./page.module.scss";
import CartSummary from "@/components/profile/CartSummary";

export default function Delivery() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <CheckoutWizard />
      </div>
      <div className={styles.cartSummary}>
        <CartSummary />
      </div>
    </div>
  );
}
