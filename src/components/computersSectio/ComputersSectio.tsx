import { StorefrontProduct } from "@/lib/api/storefront";
import StorefrontCategoryProductSection from "../shared/StorefrontCategoryProductSection";

type ComputersSectionProps = {
  initialProducts?: StorefrontProduct[];
};

export default function ComputersSection({ initialProducts }: ComputersSectionProps) {
  return (
    <StorefrontCategoryProductSection
      icon="/icons/Computer.svg"
      title="კომპიუტერები"
      categorySlug="geimingsarendero-kompiuterebi"
      initialProducts={initialProducts}
    />
  );
}

