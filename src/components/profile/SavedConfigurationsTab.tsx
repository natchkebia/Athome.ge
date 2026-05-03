"use client";

import { useEffect, useState } from "react";
import styles from "./SavedConfigurationsTab.module.scss";
import { SavedConfiguration } from "../configurator/configuratorTypes";
import { useRouter } from "next/navigation";

export default function SavedConfigurationsTab() {
  const router = useRouter();
  const [configurations, setConfigurations] = useState<SavedConfiguration[]>(
    [],
  );

  const [openConfigIds, setOpenConfigIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("savedConfigurations") || "[]",
    ) as SavedConfiguration[];

    setConfigurations(saved);
  }, []);

  const handleDelete = (id: number) => {
    const updated = configurations.filter((config) => config.id !== id);

    setConfigurations(updated);
    setOpenConfigIds((prev) => prev.filter((configId) => configId !== id));

    localStorage.setItem("savedConfigurations", JSON.stringify(updated));
  };

  const handleToggleProducts = (id: number) => {
    setOpenConfigIds((prev) =>
      prev.includes(id)
        ? prev.filter((configId) => configId !== id)
        : [...prev, id],
    );
  };

  const handleBuySystem = (config: SavedConfiguration) => {
    const cartItem = {
      id: config.id,
      title: `შენახული სისტემა #${config.id}`,
      image: config.products[0]?.image || "/images/case.svg",
      price: config.totalPrice,
      oldPrice: config.totalPrice,
      quantity: 1,
      isSystem: true,
      systemProducts: config.products,
    };

    const oldCartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");

    const alreadyInCart = oldCartItems.some(
      (item: { id: number }) => item.id === config.id,
    );

    const updatedCartItems = alreadyInCart
      ? oldCartItems
      : [cartItem, ...oldCartItems];

    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
    window.dispatchEvent(new Event("cart-updated"));

    router.push("/basket");
  };

  if (configurations.length === 0) {
    return (
      <div className={styles.empty}>
        <p>თქვენ ჯერ არ გაქვთ შენახული სისტემები</p>
      </div>
    );
  }

  return (
    <div className={styles.configurations}>
      <h2>ჩემი სისტემები</h2>

      <div className={styles.notice}>
        თქვენ გაქვთ დამატებული {configurations.length} სისტემა
      </div>

      {configurations.map((config) => {
        const isOpen = openConfigIds.includes(config.id);

        return (
          <div key={config.id} className={styles.configCard}>
            <div className={styles.infoTable}>
              <div>
                <span>სისტემის ID</span>
                <strong>{config.id}</strong>
              </div>

              <div>
                <span>კომპონენტების რაოდენობა</span>
                <strong>{config.products.length}</strong>
              </div>

              <div>
                <span>გარანტია</span>
                <strong>1 წელი</strong>
              </div>

              <div>
                <span>სისტემის ღირებულება</span>
                <strong>{config.totalPrice} ₾</strong>
              </div>

              <div>
                <span>ფასდაკლება</span>
                <strong>0 ₾</strong>
              </div>

              <div>
                <span>დამატების თარიღი და დრო</span>
                <strong>
                  {new Date(config.createdAt).toLocaleString("ka-GE")}
                </strong>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cartBtn}
                onClick={() => handleBuySystem(config)}
              >
                <img src="/images/systemBay.svg" alt="buy" />
                <span>სისტემის შეძენა</span>
              </button>

              <button
                type="button"
                className={styles.viewBtn}
                onClick={() => handleToggleProducts(config.id)}
              >
                <img src="/images/systemAye.svg" alt="view" />
                <span>
                  {isOpen
                    ? "სისტემის კომპონენტების დახურვა"
                    : "სისტემის კომპონენტების ნახვა"}
                </span>
              </button>

              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(config.id)}
              >
                <img src="/images/systemDelete.svg" alt="delete" />
                <span>სისტემის წაშლა</span>
              </button>
            </div>

            {isOpen && (
              <>
                <h3>სისტემის კომპონენტები</h3>

                <div className={styles.products}>
                  {config.products.map((product) => (
                    <div
                      key={`${config.id}-${product.id}`}
                      className={styles.product}
                    >
                      <img src={product.image} alt={product.title} />

                      <div>
                        <span>დასახელება</span>
                        <strong>{product.title}</strong>
                      </div>

                      <div>
                        <span>კოდი</span>
                        <strong>{product.id}</strong>
                      </div>

                      <div>
                        <span>რაოდენობა</span>
                        <strong>{product.quantity} ერთეული</strong>
                      </div>

                      <div>
                        <span>ფასი</span>
                        <strong>{product.price * product.quantity} ₾</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
