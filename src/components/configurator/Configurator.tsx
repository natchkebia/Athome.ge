"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Configurator.module.scss";
import {
  ConfiguratorCategoryKey,
  ConfiguratorProduct,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";
import {
  configuratorProducts,
  peripheralCategories,
  systemUnitCategories,
} from "./configuratorData";
import ConfiguratorCategoryCard from "./ConfiguratorCategoryCard";
import ConfiguratorProductModal from "./ConfiguratorProductModal";
import ConfiguratorSummary from "./ConfiguratorSummary";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import {
  FRONTEND_TO_BACKEND_SLOT,
  PERIPHERAL_PARENT_CATEGORY,
  PERIPHERAL_SLUGS,
  checkConfiguratorBuild,
  getCategoryProductsBySlugs,
  getConfiguratorBuild,
  getConfiguratorSlotProducts,
  saveConfiguratorBuild,
  type ConfiguratorBuildSlot,
  type ConfiguratorCheckResult,
  type ConfiguratorProductCard,
  type ConfiguratorSlot,
} from "@/lib/api/configurator";

type SelectedProducts = Partial<
  Record<ConfiguratorCategoryKey, SelectedConfiguratorProduct[]>
>;

type AlertState = {
  type: "warning" | "success";
  message: string;
} | null;

const REQUIRED_SYSTEM_CATEGORIES: ConfiguratorCategoryKey[] = [
  "processor",
  "motherboard",
  "ram",
  "gpu",
  "psu",
  "cooler",
  "case",
  "storage",
];

// backend slot -> a representative frontend key (for reconstructing a loaded build)
const BACKEND_TO_FRONTEND_SLOT: Record<ConfiguratorSlot, ConfiguratorCategoryKey> =
  {
    cpu: "processor",
    motherboard: "motherboard",
    ram: "ram",
    gpu: "gpu",
    psu: "psu",
    case: "case",
    cpuCooler: "cooler",
    liquidCooler: "cooler",
    storageDrive: "storage",
    caseFan: "caseFan",
  };

// Adapt a backend product card to the shape the existing modal/cards expect.
function adaptCard(
  card: ConfiguratorProductCard,
  category: ConfiguratorCategoryKey
): ConfiguratorProduct {
  const outOfStock = (card.stockStatus ?? "").toLowerCase().includes("out");
  return {
    id: card.id,
    category,
    title: card.name ?? "",
    image: normalizeMediaUrl(card.thumbnailUrl ?? undefined) || "/images/case.svg",
    price: card.effectivePrice,
    stock: outOfStock ? 0 : 99,
    specs: (card.keySpecs ?? []).map((spec) => ({
      label: spec.label ?? "",
      value: spec.value ?? "",
    })),
  };
}

export default function Configurator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCommerce();

  const [selectedCategory, setSelectedCategory] =
    useState<ConfiguratorCategoryKey | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>({});

  const [showPeripherals, setShowPeripherals] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const [modalProducts, setModalProducts] = useState<ConfiguratorProduct[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [checkResult, setCheckResult] = useState<ConfiguratorCheckResult | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const visibleCategories = showPeripherals
    ? peripheralCategories
    : systemUnitCategories;

  // Load products for the opened slot — real data for backend-mapped slots,
  // local fallback for slots the backend doesn't support yet (os, peripherals).
  useEffect(() => {
    if (!selectedCategory) return;

    const backendSlot = FRONTEND_TO_BACKEND_SLOT[selectedCategory];
    const isPeripheral = PERIPHERAL_SLUGS.has(selectedCategory);

    // slots the backend doesn't expose at all (e.g. os) → local fallback
    if (!backendSlot && !isPeripheral) {
      setModalProducts(
        configuratorProducts.filter((p) => p.category === selectedCategory)
      );
      setModalLoading(false);
      return;
    }

    let active = true;
    setModalLoading(true);
    setModalProducts([]);

    const request = backendSlot
      ? getConfiguratorSlotProducts(backendSlot).then((res) => res.items)
      : getCategoryProductsBySlugs(PERIPHERAL_PARENT_CATEGORY, [
          selectedCategory,
        ]);

    request
      .then((items) => {
        if (!active) return;
        setModalProducts(
          (items ?? []).map((card) => adaptCard(card, selectedCategory))
        );
      })
      .catch(() => {
        if (active) setModalProducts([]);
      })
      .finally(() => {
        if (active) setModalLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  const activeCategoryTitle = useMemo(() => {
    if (!selectedCategory) return "";
    const allCategories = [...systemUnitCategories, ...peripheralCategories];
    return (
      allCategories.find((category) => category.key === selectedCategory)
        ?.title || ""
    );
  }, [selectedCategory]);

  const allSelectedProducts = useMemo(() => {
    return Object.values(selectedProducts).flatMap(
      (categoryProducts) => categoryProducts || []
    );
  }, [selectedProducts]);

  const localTotalPrice = useMemo(() => {
    return allSelectedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  }, [allSelectedProducts]);

  const totalQuantity = useMemo(() => {
    return allSelectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  }, [allSelectedProducts]);

  // Build the backend slots array (one product per backend slot).
  const backendSlots = useMemo<ConfiguratorBuildSlot[]>(() => {
    const slots: ConfiguratorBuildSlot[] = [];
    const seen = new Set<ConfiguratorSlot>();
    (Object.keys(selectedProducts) as ConfiguratorCategoryKey[]).forEach(
      (key) => {
        const backendSlot = FRONTEND_TO_BACKEND_SLOT[key];
        const first = selectedProducts[key]?.[0];
        if (backendSlot && first && !seen.has(backendSlot)) {
          seen.add(backendSlot);
          slots.push({ slot: backendSlot, productId: first.id });
        }
      }
    );
    return slots;
  }, [selectedProducts]);

  // Run compatibility check whenever the build changes (need ≥2 components).
  useEffect(() => {
    if (backendSlots.length < 2) {
      setCheckResult(null);
      return;
    }

    let active = true;
    checkConfiguratorBuild(backendSlots)
      .then((res) => {
        if (active) setCheckResult(res);
      })
      .catch(() => {
        if (active) setCheckResult(null);
      });

    return () => {
      active = false;
    };
  }, [backendSlots]);

  // Load a shared build from ?build=<token>.
  useEffect(() => {
    const token = searchParams.get("build");
    if (!token) return;

    getConfiguratorBuild(token)
      .then((build) => {
        const restored: SelectedProducts = {};
        build.slots.forEach((slot) => {
          const key = BACKEND_TO_FRONTEND_SLOT[slot.slot];
          if (!key) return;
          restored[key] = [
            {
              id: slot.productId,
              category: key,
              title: slot.productName ?? "",
              image: slot.thumbnailUrl || "/images/case.svg",
              price: slot.price,
              stock: 99,
              specs: [],
              quantity: 1,
            },
          ];
        });
        setSelectedProducts(restored);
      })
      .catch(() => {});
  }, [searchParams]);

  const totalPrice = checkResult?.summary?.totalPrice ?? localTotalPrice;

  const getSafeQuantity = (product: ConfiguratorProduct, quantity: number) => {
    return Math.min(Math.max(1, quantity), product.stock);
  };

  const handleSelectProduct = (
    product: ConfiguratorProduct,
    quantity: number
  ) => {
    const safeQuantity = getSafeQuantity(product, quantity);

    const categoryProducts = selectedProducts[product.category] || [];
    const alreadySelected = categoryProducts.some(
      (item) => item.id === product.id
    );

    setSelectedProducts((prev) => {
      const prevCategory = prev[product.category] || [];
      const isSelected = prevCategory.some((item) => item.id === product.id);

      if (isSelected) {
        return {
          ...prev,
          [product.category]: prevCategory.filter(
            (item) => item.id !== product.id
          ),
        };
      }

      // one product per slot — replace any previous selection in this category.
      // slot-ს ბოლო პოზიციაზე გადავიტანთ (key ხელახლა ემატება), რომ summary-ში
      // ბოლოს არჩეული კომპონენტი ყოველთვის ზემოთ გამოჩნდეს.
      const rest = { ...prev };
      delete rest[product.category];
      return {
        ...rest,
        [product.category]: [{ ...product, quantity: safeQuantity }],
      };
    });

    // ახალი კომპონენტის დამატებისას მოდალი თავისით დაიხუროს (წაშლისას/toggle-off არა)
    if (!alreadySelected) {
      setSelectedCategory(null);
    }
  };

  const handleUpdateQuantity = (
    product: ConfiguratorProduct,
    quantity: number
  ) => {
    const safeQuantity = getSafeQuantity(product, quantity);

    setSelectedProducts((prev) => {
      const categoryProducts = prev[product.category];
      if (!categoryProducts) return prev;

      return {
        ...prev,
        [product.category]: categoryProducts.map((item) =>
          item.id === product.id ? { ...item, quantity: safeQuantity } : item
        ),
      };
    });
  };

  const handleRemoveProduct = (category: ConfiguratorCategoryKey) => {
    setSelectedProducts((prev) => {
      const copied = { ...prev };
      delete copied[category];
      return copied;
    });
  };

  const handleClearConfiguration = () => {
    setSelectedProducts({});
    setCheckResult(null);
  };

  const handleSaveConfiguration = useCallback(async () => {
    const allCategories = [...systemUnitCategories, ...peripheralCategories];

    const missingCategories = REQUIRED_SYSTEM_CATEGORIES.filter((categoryKey) => {
      const categoryProducts = selectedProducts[categoryKey];
      return !categoryProducts || categoryProducts.length === 0;
    })
      .map((categoryKey) =>
        allCategories.find((category) => category.key === categoryKey)
      )
      .filter(Boolean);

    if (missingCategories.length > 0) {
      const missingNames = missingCategories
        .map((category) => category!.title)
        .join(", ");
      setAlert({
        type: "warning",
        message: `სისტემის შესანახად სავალდებულოა შემდეგი კომპონენტების არჩევა: ${missingNames}`,
      });
      return;
    }

    setSaving(true);
    try {
      const result = await saveConfiguratorBuild(
        `კონფიგურაცია ${new Date().toLocaleDateString("ka-GE")}`,
        backendSlots
      );
      const shareUrl =
        result.shareUrl ||
        (result.shareToken
          ? `${window.location.origin}/configurator?build=${result.shareToken}`
          : "");
      setAlert({
        type: "success",
        message: shareUrl
          ? `კონფიგურაცია შენახულია. გასაზიარებელი ბმული: ${shareUrl}`
          : "კონფიგურაცია შენახულია.",
      });
    } catch {
      setAlert({
        type: "warning",
        message: "კონფიგურაციის შენახვა ვერ მოხერხდა. სცადეთ მოგვიანებით.",
      });
    } finally {
      setSaving(false);
    }
  }, [backendSlots, selectedProducts]);

  const handleAddToCart = useCallback(async () => {
    if (allSelectedProducts.length === 0) {
      setAlert({ type: "warning", message: "ჯერ აირჩიეთ კომპონენტები." });
      return;
    }
    setAddingToCart(true);
    try {
      for (const product of allSelectedProducts) {
        await addToCart(product.id, product.quantity || 1);
      }
      router.push("/basket");
    } catch {
      setAlert({
        type: "warning",
        message: "კალათაში დამატება ვერ მოხერხდა.",
      });
    } finally {
      setAddingToCart(false);
    }
  }, [addToCart, allSelectedProducts, router]);

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "კონფიგურატორი" },
  ];

  return (
    <>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb items={breadcrumbs} />
      </div>

      <main className={styles.configurator}>
        <div className={`site-wrapper ${styles.configuratorWrapper}`}>
          <div className={styles.layout}>
            <section className={styles.builder}>
              <div className={styles.toolbar}>
                <div className={styles.switchRow}>
                  <span className={!showPeripherals ? styles.activeLabel : ""}>
                    სისტემური ბლოკი
                  </span>

                  <button
                    type="button"
                    className={`${styles.switch} ${
                      showPeripherals ? styles.switchActive : ""
                    }`}
                    onClick={() => setShowPeripherals((prev) => !prev)}
                    aria-label="კონფიგურატორის ტიპის შეცვლა"
                  >
                    <span className={styles.switchThumb} />
                  </button>

                  <span className={showPeripherals ? styles.activeLabel : ""}>
                    მონიტორი და პერიფერია
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.resetViewBtn}
                  onClick={handleClearConfiguration}
                >
                  კონფიგურაციის გასუფთავება
                </button>
              </div>

              {checkResult && (
                <div
                  className={styles.compatBanner}
                  data-verdict={checkResult.verdict}
                >
                  <strong>
                    {checkResult.verdict === "compatible" &&
                      "✓ კომპონენტები თავსებადია"}
                    {checkResult.verdict === "hasWarnings" &&
                      "⚠ თავსებადია, მაგრამ არის გაფრთხილებები"}
                    {checkResult.verdict === "incompatible" &&
                      "✕ კომპონენტები არ არის თავსებადი"}
                    {checkResult.verdict === "partialBuild" &&
                      "კონფიგურაცია არასრულია"}
                  </strong>
                  {checkResult.allIssues.length > 0 && (
                    <ul>
                      {checkResult.allIssues.slice(0, 5).map((issue, i) => (
                        <li key={i}>{issue.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className={styles.grid}>
                {visibleCategories.map((category) => (
                  <ConfiguratorCategoryCard
                    key={category.key}
                    category={category}
                    selectedProducts={selectedProducts[category.key] || []}
                    onClick={() => setSelectedCategory(category.key)}
                    onRemove={() => handleRemoveProduct(category.key)}
                  />
                ))}
              </div>
            </section>

            <ConfiguratorSummary
              selectedProducts={selectedProducts}
              totalPrice={totalPrice}
              onSaveConfiguration={handleSaveConfiguration}
              onAddToCart={handleAddToCart}
              saving={saving}
              addingToCart={addingToCart}
            />
          </div>
        </div>

        {selectedCategory && (
          <ConfiguratorProductModal
            title={activeCategoryTitle || "დეტალები"}
            products={modalProducts}
            loading={modalLoading}
            selectedProducts={selectedProducts[selectedCategory] || []}
            onClose={() => setSelectedCategory(null)}
            onSelect={handleSelectProduct}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}

        {alert && (
          <div className={styles.alertOverlay}>
            <div className={styles.alertModal}>
              <button
                type="button"
                className={styles.alertClose}
                onClick={() => setAlert(null)}
                aria-label="დახურვა"
              >
                ×
              </button>

              <img
                src={
                  alert.type === "warning"
                    ? "/images/warning.svg"
                    : "/images/save.svg"
                }
                alt={alert.type}
                className={styles.alertIcon}
              />

              <p>
                {alert.message}

                {alert.type === "success" && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className={styles.alertLink}
                      onClick={() => router.push("/profile?tab=configurations")}
                    >
                      ამ გვერდზე
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
