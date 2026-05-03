// "use client";

// import { useState } from "react";
// import styles from "./basket.module.scss";
// import CartTab from "@/components/profile/CartTab";
// import { useRouter } from "next/navigation";
// import CartSummary from "@/components/profile/CartSummary";

// export default function BasketFullPage() {
//   const router = useRouter();

//   const handleGoToProducts = () => {
//     router.push("/products");
//   };
//   const [cartItems, setCartItems] = useState([
//     {
//       id: 14736,
//       title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
//       image: "/images/discountPc.png",
//       price: 6500,
//       oldPrice: 9500,
//       quantity: 2,
//     },
//   ]);

//   return (
//     <div className={styles.basketPage}>
//       {cartItems.length === 0 ? (
//         <>
//           <h1 className={styles.title}>კალათა</h1>
//           <div className={styles.contentBox}>
//             <div>
//               <h2 className={styles.subtitle}>შენი კალათა ცარიელია</h2>
//               <p className={styles.text}>
//                 დაამატე პროდუქტები და შეამოწმე აქ შენი კალათის შიგთავსი
//               </p>
//               <img
//                 src="/icons/Basket.svg"
//                 alt="empty basket"
//                 className={styles.image}
//               />
//             </div>
//             <button className={styles.button} onClick={handleGoToProducts}>
//               გადადი პროდუქტებზე
//             </button>
//           </div>
//         </>
//       ) : (
//         <div className={styles.cartwrapper}>
//           <div className={styles.cartContainer}>
//             <CartTab showSummary={false} />
//           </div>
//           <CartSummary showItems={false}/>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import styles from "./basket.module.scss";
import CartTab, { CartItem } from "@/components/profile/CartTab";
import { useRouter } from "next/navigation";
import CartSummary from "@/components/profile/CartSummary";

export default function BasketFullPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    const savedItems = JSON.parse(
      localStorage.getItem("cartItems") || "[]"
    ) as CartItem[];

    setCartItems(savedItems);
  };

  useEffect(() => {
    loadCart();

    window.addEventListener("cart-updated", loadCart);

    return () => {
      window.removeEventListener("cart-updated", loadCart);
    };
  }, []);

  const handleGoToProducts = () => {
    router.push("/");
  };

  return (
    <div className={styles.basketPage}>
      {cartItems.length === 0 ? (
        <>
          <h1 className={styles.title}>კალათა</h1>

          <div className={styles.contentBox}>
            <div>
              <h2 className={styles.subtitle}>შენი კალათა ცარიელია</h2>

              <p className={styles.text}>
                დაამატე პროდუქტები და შეამოწმე აქ შენი კალათის შიგთავსი
              </p>

              <img
                src="/icons/Basket.svg"
                alt="empty basket"
                className={styles.image}
              />
            </div>

            <button className={styles.button} onClick={handleGoToProducts}>
              გადადი პროდუქტებზე
            </button>
          </div>
        </>
      ) : (
        <div className={styles.cartwrapper}>
          <div className={styles.cartContainer}>
            <CartTab showSummary={false} />
          </div>

          <CartSummary showItems={false} />
        </div>
      )}
    </div>
  );
}