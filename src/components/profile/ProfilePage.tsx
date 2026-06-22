"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentUser,
  logout as logoutUser,
  type AuthUser,
} from "@/lib/api/auth";
import {
  getStoredProfileGender,
  storeProfileGender,
  type ProfileGender,
} from "@/lib/auth/profilePreferences";
import { getProfileOrders } from "@/lib/api/orders";
import styles from "./ProfilePage.module.scss";
import InfoTab from "./InfoTab";
import OrdersTab from "./OrdersTab";
import CartTab from "./CartTab";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import WishlistTab from "./WishlistTab";
import SavedConfigurationsTab from "./SavedConfigurationsTab";
import AtHomeLoader from "../shared/AtHomeLoader";
import { useCommerce } from "@/contexts/CommerceContext";

type ProfileTab =
  | "info"
  | "orders"
  | "cart"
  | "wishlist"
  | "configurations"
  | "logout";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, wishlist } = useCommerce();

  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gender, setGender] = useState<ProfileGender>("male");
  const [ordersCount, setOrdersCount] = useState(0);
  const [savedSystemsCount, setSavedSystemsCount] = useState(0);

  // შეკვეთების რაოდენობა badge-ისთვის.
  useEffect(() => {
    let active = true;
    getProfileOrders(1, 1)
      .then((res) => {
        if (active) setOrdersCount(res.totalCount ?? res.items.length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // შენახული სისტემები localStorage-შია — ვკითხულობთ თავიდან და ტაბის ცვლილებაზე.
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("savedConfigurations") || "[]"
      );
      setSavedSystemsCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setSavedSystemsCount(0);
    }
  }, [activeTab]);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (
      tab === "info" ||
      tab === "orders" ||
      tab === "cart" ||
      tab === "wishlist" ||
      tab === "configurations" ||
      tab === "logout"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;
    setGender(getStoredProfileGender());

    getCurrentUser()
      .then((currentUser) => {
        if (!isActive) {
          return;
        }

        if (!currentUser) {
          router.replace("/authorization");
          return;
        }

        if (currentUser.gender) {
          const normalizedGender =
            currentUser.gender.toLowerCase() === "female" ? "female" : "male";
          storeProfileGender(normalizedGender);
          setGender(normalizedGender);
        }

        setUser(currentUser);
      })
      .catch(() => {
        router.replace("/authorization");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  const menuItems: {
    id: ProfileTab;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    {
      id: "info",
      label: "პერსონალური ინფორმაცია",
      icon: "/icons/profile1.svg",
    },
    {
      id: "orders",
      label: "ჩემი შეკვეთები",
      icon: "/icons/profile2.svg",
      badge: ordersCount,
    },
    {
      id: "cart",
      label: "ჩემი კალათა",
      icon: "/icons/profile3.svg",
      badge: cart.totalItems,
    },
    {
      id: "wishlist",
      label: "სურვილების სია",
      icon: "/icons/profile4.svg",
      badge: wishlist.totalItems,
    },
    {
      id: "configurations",
      label: "შენახული სისტემები",
      icon: "/icons/Computer-black.svg",
      badge: savedSystemsCount,
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
      case "configurations":
        return "შენახული სისტემები";
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMenuClick = async (tab: ProfileTab) => {
    if (tab !== "logout") {
      setActiveTab(tab);
      return;
    }

    await logoutUser();
    router.push("/authorization");
  };

  const profileIcon =
    gender === "female" ? "/icons/profileWoman.svg" : "/icons/profilePerson.svg";

  if (isLoading) {
    return (
      <>
        <Breadcrumb items={breadcrumbs} />
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <AtHomeLoader variant="section" label="იტვირთება" />
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

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
                ) : (
                  <img src={profileIcon} alt="user" />
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

              <p className={styles.userId}>ID {String(user.id).padStart(6, "0")}</p>
            </div>

            <ul className={styles.menu}>
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={activeTab === item.id ? styles.active : ""}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={styles.icon}
                  />

                  {item.label}

                  {Boolean(item.badge) && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.content}>
            {activeTab === "info" && (
              <InfoTab
                user={user}
                gender={gender}
                onGenderChange={setGender}
                onUserChange={setUser}
              />
            )}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "cart" && <CartTab />}
            {activeTab === "wishlist" && <WishlistTab variant="profile" />}
            {activeTab === "configurations" && <SavedConfigurationsTab />}
          </section>
        </div>
      </div>
    </>
  );
}
