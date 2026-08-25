"use client";

import { use } from "react";
import PrebuiltConfigurator from "@/components/products/PrebuiltConfigurator";

export default function PrebuiltEditPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  return (
    <main className="site-wrapper" style={{ paddingBlock: 40 }}>
      <PrebuiltConfigurator productId={Number(productId)} />
    </main>
  );
}
