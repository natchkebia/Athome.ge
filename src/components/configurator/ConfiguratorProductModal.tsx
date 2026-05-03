"use client";

import { useMemo, useState } from "react";
import styles from "./Configurator.module.scss";
import {
  ConfiguratorProduct,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";

type Props = {
  title: string;
  products: ConfiguratorProduct[];
  selectedProducts: SelectedConfiguratorProduct[];
  onClose: () => void;
  onSelect: (product: ConfiguratorProduct, quantity: number) => void;
  onUpdateQuantity: (product: ConfiguratorProduct, quantity: number) => void;
};

const brands = ["ყველა", "AsRock", "Asus", "Gigabyte", "Msi"];

export default function ConfiguratorProductModal({
  title,
  products,
  selectedProducts,
  onClose,
  onSelect,
  onUpdateQuantity,
}: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [activeBrand, setActiveBrand] = useState("ყველა");

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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="დახურვა"
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
                placeholder="ვეძებოთ რას ეძებ?..."
              />
              <span>⌕</span>
            </div>

            <ul>
              {brands.map((brand) => (
                <li
                  key={brand}
                  className={activeBrand === brand ? styles.activeFilter : ""}
                  onClick={() => setActiveBrand(brand)}
                >
                  <span>{brand}</span>
                  <strong>{getBrandCount(brand)}</strong>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.productList}>
            {filteredProducts.length === 0 ? (
              <div className={styles.emptyProducts}>
                შესაბამისი პროდუქტი ვერ მოიძებნა
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = Boolean(getSelectedProduct(product.id));
                const quantity = getQuantity(product);
                const rowTotal = product.price * quantity;

                return (
                  <div
                    key={product.id}
                    className={`${styles.productRow} ${
                      isSelected ? styles.productRowSelected : ""
                    }`}
                  >
                    <img src={product.image} alt={product.title} />

                    <div className={styles.productInfo}>
                      <h3>{product.title}</h3>

                      <ul>
                        {product.specs.map((spec) => (
                          <li key={`${product.id}-${spec.label}`}>
                            <span>{spec.label}</span>
                            <strong>{spec.value}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.productAction}>
                      <strong>{rowTotal} ₾</strong>

                      <label>
                        რაოდენობა
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

                      <small>მარაგშია: {product.stock} ერთეული</small>

                      <button
                        type="button"
                        className={isSelected ? styles.removeProductBtn : ""}
                        onClick={() => onSelect(product, quantity)}
                      >
                        {isSelected ? "წაშლა" : "დამატება"}
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
