"use client";

import { useState } from "react";
import styles from "./ProfilePage.module.scss";
import InfoTab from "./InfoTab";
import OrdersTab from "./OrdersTab";
import CartTab from "./CartTab";
import Breadcrumb from "../ breadcrumb/Breadcrumb";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "info" | "orders" | "cart" | "wishlist" | "logout"
  >("info");

  const user = {
    id: "000095214",
    firstName: "გიორგი",
    lastName: "ბაგრატიონი",
  };

  const menuItems = [
    { id: "info", label: "პერსონალური ინფორმაცია", icon: "/icons/profile1.svg" },
    { id: "orders", label: "ჩემი შეკვეთები", icon: "/icons/profile2.svg" },
    { id: "cart", label: "ჩემი კალათა", icon: "/icons/profile3.svg", badge: 28 },
    { id: "wishlist", label: "სურვილების სია", icon: "/icons/profile4.svg", badge: 28 },
    { id: "logout", label: "გასვლა", icon: "/icons/profile5.svg" },
  ];

  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case "info":
        return "პერსონალური ინფორმაცია";
      case "orders":
        return "ჩემი შეკვეთები";
      case "cart":
        return "ჩემი კალათა";
      case "wishlist":
        return "სურვილების სია";
      case "logout":
        return "გასვლა";
      default:
        return "";
    }
  };

  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: getBreadcrumbLabel() },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* --- Sidebar --- */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                <img src="./icons/profilePerson.svg" alt="user" />
              </div>
              <h3>
                {user.firstName} {user.lastName}
              </h3>
              <p className={styles.userId}>ID {user.id}</p>
            </div>

            <ul className={styles.menu}>
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={activeTab === item.id ? styles.active : ""}
                >
                  <img src={item.icon} alt={item.label} className={styles.icon} />
                  {item.label}
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </li>
              ))}
            </ul>
          </aside>

          {/* --- Content --- */}
          <section className={styles.content}>
            {activeTab === "info" && <InfoTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "cart" && <CartTab />}
            {activeTab === "wishlist" && (
              <h4>სურვილების სია — შენახული ნივთები</h4>
            )}
            {activeTab === "logout" && (
              <div>
                <h4>გინდა გამოსვლა?</h4>
                <button className={styles.save}>გასვლა</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
