"use client";

import { useMemo, useState } from "react";
import styles from "./Configurator.module.scss";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import ProductThumb from "./ProductThumb";
import {
  ConfiguratorProduct,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

type Props = {
  title: string;
  products: ConfiguratorProduct[];
  loading?: boolean;
  selectedProducts: SelectedConfiguratorProduct[];
  onClose: () => void;
  onSelect: (
    product: ConfiguratorProduct,
    quantity: number,
  ) => Promise<ProductSelectionResult>;
  onUpdateQuantity: (product: ConfiguratorProduct, quantity: number) => void;
};

export type ProductSelectionResult = {
  allowed: boolean;
  message?: string;
};

const brands = ["ყველა", "AsRock", "Asus", "Gigabyte", "Msi"];
const EN_SPEC_LABELS: Record<string, string> = {
  ჩიპსეტი: "Chipset", სოკეტი: "Socket", მეხსიერება: "Memory", ფორმფაქტორი: "Form factor",
  ბირთვი: "Cores", ნაკადი: "Threads", მოცულობა: "Capacity", ტიპი: "Type", სიხშირე: "Frequency",
  ზომა: "Size", განახლება: "Refresh rate", პანელი: "Panel", მიკროფონი: "Microphone",
  განათება: "Lighting", სენსორი: "Sensor", კავშირი: "Connection", სიმძლავრე: "Power",
  სერტიფიკატი: "Certification", მოდულარული: "Modular", ვენტილატორი: "Fan", ფერი: "Color",
  ქულერები: "Fans", გვერდი: "Side panel", ინტერფეისი: "Interface", სიჩქარე: "Speed",
  ვერსია: "Version", ლიცენზია: "License", არქიტექტურა: "Architecture",
};

export default function ConfiguratorProductModal({
  title,
  products,
  loading = false,
  selectedProducts,
  onClose,
  onSelect,
  onUpdateQuantity,
}: Props) {
  const en = useStorefrontLocale() === "en";
  const [searchValue, setSearchValue] = useState("");
  const [activeBrand, setActiveBrand] = useState("ყველა");
  const [checkingProductId, setCheckingProductId] = useState<number | null>(null);
  const [compatibilityErrors, setCompatibilityErrors] = useState<
    Record<number, string>
  >({});

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    return selectedProducts.reduce<Record<number, number>>((acc, product) => {
      acc[product.id] = product.quantity;
      return acc;
    }, {});
  });

  const filteredProducts = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const productText = [
        product.title,
        product.price.toString(),
        product.stock.toString(),
        ...product.specs.flatMap((spec) => [spec.label, spec.value]),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || productText.includes(search);

      const matchesBrand =
        activeBrand === "ყველა" ||
        product.title.toLowerCase().includes(activeBrand.toLowerCase());

      return matchesSearch && matchesBrand;
    });
  }, [products, searchValue, activeBrand]);

  const getBrandCount = (brand: string) => {
    if (brand === "ყველა") return products.length;

    return products.filter((product) =>
      product.title.toLowerCase().includes(brand.toLowerCase()),
    ).length;
  };

  const normalizeQuantity = (value: string, stock: number) => {
    const numericValue = Number(value) || 1;
    return Math.min(Math.max(1, numericValue), stock);
  };

  const getSelectedProduct = (productId: number) => {
    return selectedProducts.find((product) => product.id === productId);
  };

  const handleQuantityChange = (
    product: ConfiguratorProduct,
    value: string,
  ) => {
    const quantity = normalizeQuantity(value, product.stock);

    setQuantities((prev) => ({
      ...prev,
      [product.id]: quantity,
    }));

    const selectedProduct = getSelectedProduct(product.id);

    if (selectedProduct) {
      onUpdateQuantity(product, quantity);
    }
  };

  const getQuantity = (product: ConfiguratorProduct) => {
    const selectedProduct = getSelectedProduct(product.id);

    if (selectedProduct) {
      return quantities[product.id] || selectedProduct.quantity;
    }

    return quantities[product.id] || 1;
  };

  const handleSelect = async (
    product: ConfiguratorProduct,
    quantity: number,
  ) => {
    setCheckingProductId(product.id);
    setCompatibilityErrors((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });

    try {
      const result = await onSelect(product, quantity);
      if (!result.allowed) {
        setCompatibilityErrors((prev) => ({
          ...prev,
          [product.id]:
            result.message || (en ? "This product is not compatible with the selected components." : "ეს პროდუქტი არჩეულ კომპონენტებთან თავსებადი არ არის."),
        }));
      }
    } finally {
      setCheckingProductId(null);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label={en ? "Close" : "დახურვა"}
        >
          ×
        </button>

        <h2>{title}</h2>

        <div className={styles.modalContent}>
          <aside className={styles.modalFilters}>
            <div className={styles.modalSearch}>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={en ? "Search products..." : "ვეძებოთ რას ეძებ?..."}
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <ul>
              {brands.map((brand) => (
                <li
                  key={brand}
                  className={activeBrand === brand ? styles.activeFilter : ""}
                  onClick={() => setActiveBrand(brand)}
                >
                  <span>{en && brand === "ყველა" ? "All" : brand}</span>
                  <strong>{getBrandCount(brand)}</strong>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.productList}>
            {loading ? (
              <AtHomeLoader variant="section" />
            ) : filteredProducts.length === 0 ? (
              <div className={styles.emptyProducts}>
                {en ? "No matching products found" : "შესაბამისი პროდუქტი ვერ მოიძებნა"}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = Boolean(getSelectedProduct(product.id));
                const quantity = getQuantity(product);
                const rowTotal = product.price * quantity;
                const compatibilityError = compatibilityErrors[product.id];
                const isChecking = checkingProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className={`${styles.productRow} ${
                      isSelected ? styles.productRowSelected : ""
                    }`}
                  >
                    <ProductThumb src={product.image} alt={product.title} />

                    <div className={styles.productInfo}>
                      <h3>{product.title}</h3>

                      <ul>
                        {product.specs.map((spec) => (
                          <li key={`${product.id}-${spec.label}`}>
                            <span>{en ? EN_SPEC_LABELS[spec.label] ?? spec.label : spec.label}</span>
                            <strong>{spec.value}</strong>
                          </li>
                        ))}
                      </ul>

                      {compatibilityError && (
                        <div className={styles.productCompatibilityError}>
                          <strong>{en ? "✕ Not compatible" : "✕ არ არის თავსებადი"}</strong>
                          <span>{compatibilityError}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.productAction}>
                      <strong>{rowTotal} ₾</strong>

                      <label>
                        {en ? "Quantity" : "რაოდენობა"}
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(event) =>
                            handleQuantityChange(product, event.target.value)
                          }
                        />
                      </label>

                      <small>{en ? `In stock: ${product.stock} units` : `მარაგშია: ${product.stock} ერთეული`}</small>

                      <button
                        type="button"
                        className={isSelected ? styles.removeProductBtn : ""}
                        disabled={isChecking}
                        onClick={() => handleSelect(product, quantity)}
                      >
                        {isChecking
                          ? en ? "Checking..." : "მოწმდება..."
                          : isSelected
                            ? en ? "Remove" : "წაშლა"
                            : en ? "Add" : "დამატება"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
