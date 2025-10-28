"use client";
import { useState } from "react";
import styles from "./CartTab.module.scss";

export default function CartTab() {
  const [cartItems, setCartItems] = useState([
    {
      id: 14736,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14737,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14738,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
    {
      id: 14739,
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      image: "/images/discountPc.png",
      price: 6500,
      oldPrice: 9500,
      quantity: 22,
    },
  ]);

  const increase = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrease = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className={styles.cartSection}>
      {cartItems.length === 0 ? (
        <h4>ჩემი კალათა</h4>
      ) : (
        <>
          <h4>ჩემი კალათა</h4>
          <div className={styles.cartList}>
            {cartItems.map((item) => (
              <div className={styles.cartCard} key={item.id}>
                <div className={styles.left}>
                  <img src={item.image} alt={item.title} />
                  <div className={styles.info}>
                    <p>კოდი: {item.id}</p>
                    <h5>{item.title}</h5>
                  </div>
                </div>

                <div className={styles.center}>
                  <div className={styles.counter}>
                    <button onClick={() => decrease(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increase(item.id)}>+</button>
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>
                      {item.price.toLocaleString()} ₾
                    </span>
                    <span className={styles.oldPrice}>
                      {item.oldPrice.toLocaleString()} ₾
                    </span>
                  </div>
                  <img
                    src="/icons/trashCan.svg"
                    alt="remove"
                    onClick={() => removeItem(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.total}>
              ჯამური თანხა: <strong>{total.toLocaleString()} ₾</strong>
            </div>
            <button className={styles.orderBtn}>შეკვეთის გაფორმება</button>
          </div>
        </>
      )}
    </div>
  );
}
