import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import styles from "./page.module.scss";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import CartSummary from "@/components/profile/CartSummary";

export default function Delivery() {
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "მიწოდების დეტალები" },
  ];
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
