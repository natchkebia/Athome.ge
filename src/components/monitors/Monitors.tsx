import { StorefrontProduct } from "@/lib/api/storefront";
import StorefrontCategoryProductSection from "../shared/StorefrontCategoryProductSection";

type MonitorsSectionProps = {
  initialProducts?: StorefrontProduct[];
};

export default function MonitorsSection({ initialProducts }: MonitorsSectionProps) {
  return (
    <StorefrontCategoryProductSection
      icon="/icons/Monitor.svg"
      title="მონიტორები"
      categorySlug="monitor"
      initialProducts={initialProducts}
    />
  );
}

