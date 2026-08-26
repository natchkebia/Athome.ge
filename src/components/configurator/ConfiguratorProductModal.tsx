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
import type { ConfiguratorBrandFacet } from "@/lib/api/configurator";
import type { StorefrontCategoryFilter, StorefrontCategoryFilterSet } from "@/lib/api/storefront";
import DynamicProductFilter, { type DynamicFilterValues } from "../products/DynamicProductFilter";

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
  brands?: ConfiguratorBrandFacet[];
  filters?: StorefrontCategoryFilter[];
  filterValues: DynamicFilterValues;
  priceBounds: [number, number];
  onFilterValuesChange: (values: DynamicFilterValues) => void;
  hiddenByCompatibility?: number;
  hiddenByStock?: number;
  totalCount?: number;
  onClearCompatibilityFilter?: () => void;
};

export type ProductSelectionResult = {
  allowed: boolean;
  message?: string;
};

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
  brands = [],
  filters = [],
  filterValues,
  priceBounds,
  onFilterValuesChange,
  hiddenByCompatibility = 0,
  hiddenByStock = 0,
  totalCount = 0,
  onClearCompatibilityFilter,
}: Props) {
  const en = useStorefrontLocale() === "en";
  const [searchValue, setSearchValue] = useState("");
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

      return matchesSearch;
    });
  }, [products, searchValue]);

  const schema = useMemo<StorefrontCategoryFilterSet>(() => ({
    categoryId: 0,
    filterCount: filters.length,
    totalProductCount: totalCount,
    filters,
    brands: brands.map((brand) => ({
      brandId: brand.id,
      slug: brand.slug,
      name: brand.name,
      productCount: brand.productCount,
    })),
  }), [brands, filters, totalCount]);
  const effectiveFilterValues = filterValues.price[0] === 0 && filterValues.price[1] === 0
    ? { ...filterValues, price: priceBounds }
    : filterValues;

  const normalizeQuantity = (value: string, stock: number) => {
    const numericValue = Number(value) || 1;
    return stock > 0 ? Math.min(Math.max(1, numericValue), stock) : 1;
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

            <DynamicProductFilter
              schema={schema}
              values={effectiveFilterValues}
              priceBounds={priceBounds}
              onChange={onFilterValuesChange}
              compact
            />
          </aside>

          <div className={styles.productList}>
            {hiddenByCompatibility > 0 && (
              <div className={styles.compatibilityFilterNotice}>
                <span>
                  {en
                    ? `Showing ${totalCount} — ${hiddenByCompatibility} more do not fit your selection`
                    : `ნაჩვენებია ${totalCount} — კიდევ ${hiddenByCompatibility} არ ჯდება თქვენს არჩევანთან`}
                </span>
                <button type="button" onClick={onClearCompatibilityFilter}>
                  {en ? "Clear filter" : "ფილტრის მოხსნა"}
                </button>
              </div>
            )}
            {hiddenByStock > 0 && (
              <div className={styles.stockFilterNotice}>
                {en
                  ? `${hiddenByStock} products are hidden by the stock filter`
                  : `მარაგის ფილტრით დამალულია ${hiddenByStock} პროდუქტი`}
              </div>
            )}
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

                      {product.compatibilityStatus === "unknown" && (
                        <div className={styles.compatibilityUnknown}>
                          {en ? "Compatibility could not be checked" : "თავსებადობა ვერ შემოწმდა"}
                        </div>
                      )}

                      {compatibilityError && (
                        <div className={styles.productCompatibilityError}>
                          <strong>{en ? "✕ Not compatible" : "✕ არ არის თავსებადი"}</strong>
                          <span>{compatibilityError}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.productAction}>
                      <strong>{rowTotal} ₾</strong>

                      {product.priceDelta != null && Math.abs(product.priceDelta) >= 0.005 && (
                        <div className={product.priceDelta < 0 ? styles.negativeDelta : styles.positiveDelta}>
                          <span className={styles.deltaBadge}>
                            {product.priceDelta > 0 ? "+" : "−"}{Math.abs(product.priceDelta).toFixed(2)} ₾
                          </span>
                        </div>
                      )}

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

                      <div className={styles.stockInfo}>
                        <small>
                          {product.stock <= 0
                            ? (en ? "Out of stock" : "მარაგში არ არის")
                            : product.stock <= 10
                              ? (en ? `In stock: ${product.stock} units` : `მარაგშია: ${product.stock} ერთეული`)
                              : (en ? "In stock" : "მარაგშია")}
                        </small>

                      </div>

                      <button
                        type="button"
                        className={isSelected ? styles.removeProductBtn : ""}
                        disabled={isChecking || (!isSelected && product.stock <= 0)}
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
