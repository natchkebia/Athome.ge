"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Configurator.module.scss";
import {
  ConfiguratorCategoryKey,
  ConfiguratorProduct,
  SavedConfiguration,
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

export default function Configurator() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState<ConfiguratorCategoryKey | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>(
    {},
  );

  const [showPeripherals, setShowPeripherals] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const visibleCategories = showPeripherals
    ? peripheralCategories
    : systemUnitCategories;

  const activeProducts = useMemo(() => {
    if (!selectedCategory) return [];

    return configuratorProducts.filter(
      (product) => product.category === selectedCategory,
    );
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
      (categoryProducts) => categoryProducts || [],
    );
  }, [selectedProducts]);

  const totalPrice = useMemo(() => {
    return allSelectedProducts.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
  }, [allSelectedProducts]);

  const totalQuantity = useMemo(() => {
    return allSelectedProducts.reduce((sum, product) => {
      return sum + product.quantity;
    }, 0);
  }, [allSelectedProducts]);

  const getSafeQuantity = (product: ConfiguratorProduct, quantity: number) => {
    return Math.min(Math.max(1, quantity), product.stock);
  };

  const handleSelectProduct = (
    product: ConfiguratorProduct,
    quantity: number,
  ) => {
    const safeQuantity = getSafeQuantity(product, quantity);

    setSelectedProducts((prev) => {
      const categoryProducts = prev[product.category] || [];

      const alreadySelected = categoryProducts.some(
        (item) => item.id === product.id,
      );

      if (alreadySelected) {
        return {
          ...prev,
          [product.category]: categoryProducts.filter(
            (item) => item.id !== product.id,
          ),
        };
      }

      return {
        ...prev,
        [product.category]: [
          ...categoryProducts,
          {
            ...product,
            quantity: safeQuantity,
          },
        ],
      };
    });
  };

  const handleUpdateQuantity = (
    product: ConfiguratorProduct,
    quantity: number,
  ) => {
    const safeQuantity = getSafeQuantity(product, quantity);

    setSelectedProducts((prev) => {
      const categoryProducts = prev[product.category];

      if (!categoryProducts) return prev;

      return {
        ...prev,
        [product.category]: categoryProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: safeQuantity,
              }
            : item,
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
  };

  const handleSaveConfiguration = () => {
    const allCategories = [...systemUnitCategories, ...peripheralCategories];

    const missingCategories = REQUIRED_SYSTEM_CATEGORIES.filter(
      (categoryKey) => {
        const categoryProducts = selectedProducts[categoryKey];
        return !categoryProducts || categoryProducts.length === 0;
      },
    )
      .map((categoryKey) =>
        allCategories.find((category) => category.key === categoryKey),
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

    const savedConfiguration: SavedConfiguration = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      products: allSelectedProducts,
      totalPrice,
      totalQuantity,
    };

    const oldConfigurations = JSON.parse(
      localStorage.getItem("savedConfigurations") || "[]",
    ) as SavedConfiguration[];

    localStorage.setItem(
      "savedConfigurations",
      JSON.stringify([savedConfiguration, ...oldConfigurations]),
    );

    setAlert({
      type: "success",
      message: "სისტემა შეინახა, შენახული სისტემების ნახვა შეგიძლიათ",
    });
  };

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "კონფიგურატორი" },
  ];

  return (
    <>
      <div style={{ marginLeft: "30px" }}>
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
            />
          </div>
        </div>

        {selectedCategory && (
          <ConfiguratorProductModal
            title={activeCategoryTitle || "დეტალები"}
            products={activeProducts}
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
