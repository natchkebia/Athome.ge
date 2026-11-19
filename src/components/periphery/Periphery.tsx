import { StorefrontProduct } from "@/lib/api/storefront";
import StorefrontCategoryProductSection from "../shared/StorefrontCategoryProductSection";
import styles from "./Periphery.module.css";

type PeripherySectionProps = {
  initialProducts?: StorefrontProduct[];
  mobileFallbackProducts?: StorefrontProduct[];
};

export default function PeripherySection({ initialProducts, mobileFallbackProducts }: PeripherySectionProps) {
  const original = (
    <StorefrontCategoryProductSection
      icon="/icons/Mouse.svg"
      title="პერიფერია"
      categorySlug="peripherials"
      initialProducts={initialProducts}
    />
  );

  if (initialProducts?.length || !mobileFallbackProducts?.length) return original;

  return <>
    <div className={styles.desktop}>{original}</div>
    <div className={styles.mobile}>
      <StorefrontCategoryProductSection
        icon="/icons/Mouse.svg"
        title="პერიფერია"
        categorySlug="peripherials"
        initialProducts={mobileFallbackProducts}
      />
    </div>
  </>;
}

