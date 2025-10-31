"use client";

import { useState } from "react";
import styles from "./ProfilePage.module.scss";
import InfoTab from "./InfoTab";
import OrdersTab from "./OrdersTab";
import CartTab from "./CartTab";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import WishlistTab from "./WishlistTab";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "info" | "orders" | "cart" | "wishlist" | "logout"
  >("info");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const user = {
    id: "000095214",
    firstName: "გიორგი",
    lastName: "ბაგრატიონი",
    gender: "მამრობითი", 
  };

  const menuItems = [
    {
      id: "info",
      label: "პერსონალური ინფორმაცია",
      icon: "/icons/profile1.svg",
    },
    { id: "orders", label: "ჩემი შეკვეთები", icon: "/icons/profile2.svg" },
    {
      id: "cart",
      label: "ჩემი კალათა",
      icon: "/icons/profile3.svg",
      badge: 28,
    },
    {
      id: "wishlist",
      label: "სურვილების სია",
      icon: "/icons/profile4.svg",
      badge: 28,
    },
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {profileImage ? (
                  <img src={profileImage} alt="user" />
                ) : user.gender === "მდედრობითი" ? (
                  <img src="./icons/profileWoman.svg" alt="user" />
                ) : (
                  <img src="./icons/profilePerson.svg" alt="user" />
                )}
                <label className={styles.cameraOverlay}>
                  <img src="/icons/profileCamera.svg" alt="upload" />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
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
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={styles.icon}
                  />
                  {item.label}
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </li>
              ))}
            </ul>
          </aside>
          <section className={styles.content}>
            {activeTab === "info" && <InfoTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "cart" && <CartTab />}
            {activeTab === "wishlist" && <WishlistTab variant="profile" />}
          </section>
        </div>
      </div>
    </>
  );
}
