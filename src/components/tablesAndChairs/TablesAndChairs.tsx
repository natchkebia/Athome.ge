import { StorefrontProduct } from "@/lib/api/storefront";
import StorefrontCategoryProductSection from "../shared/StorefrontCategoryProductSection";

type TablesAndChairsProps = {
  initialProducts?: StorefrontProduct[];
};

export default function TablesAndChairs({ initialProducts }: TablesAndChairsProps) {
  return (
    <StorefrontCategoryProductSection
      icon="/icons/Table.svg"
      title="მაგიდები და სავარძლები"
      categorySlugs={["table", "gaming-chair"]}
      initialProducts={initialProducts}
    />
  );
}

