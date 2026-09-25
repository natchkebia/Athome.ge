import { StorefrontProduct } from "@/lib/api/storefront";
import StorefrontCategoryProductSection from "../shared/StorefrontCategoryProductSection";

type PeripherySectionProps = {
  initialProducts?: StorefrontProduct[];
};

export default function PeripherySection({ initialProducts }: PeripherySectionProps) {
  return (
    <StorefrontCategoryProductSection
      icon="/icons/Mouse.svg"
      title="პერიფერია"
      categorySlug="peripherials"
      initialProducts={initialProducts}
    />
  );
}

