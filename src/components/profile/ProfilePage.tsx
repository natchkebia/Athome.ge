"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentUser,
  logout as logoutUser,
  uploadProfileAvatar,
  deleteProfileAvatar,
  type AuthUser,
} from "@/lib/api/auth";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useToast } from "@/contexts/ToastContext";
import {
  getStoredProfileGender,
  storeProfileGender,
  storeProfileAvatar,
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
import { getProfileConfiguratorBuilds } from "@/lib/api/configurator";

type ProfileTab =
  | "info"
  | "orders"
  | "cart"
  | "wishlist"
  | "configurations"
  | "logout";

// ავატარს დიდი რეზოლუცია არ სჭირდება — ატვირთვამდე ვამცირებთ/ვკუმშავთ,
// რომ backend-ის ატვირთვის ლიმიტს (413 Payload Too Large) არ გადავაჭარბოთ.
async function resizeAvatar(
  file: File,
  maxSize = 512,
  quality = 0.85
): Promise<File> {
  const bitmapUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image load failed"));
      image.src = bitmapUrl;
    });

    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
      if (width >= height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "avatar";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, wishlist } = useCommerce();
  const { showToast } = useToast();

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

  // შენახული სისტემები ავტორიზებული მომხმარებლის პროფილიდან მოდის.
  useEffect(() => {
    let active = true;
    getProfileConfiguratorBuilds()
      .then((items) => active && setSavedSystemsCount(items?.length ?? 0))
      .catch(() => active && setSavedSystemsCount(0));
    return () => { active = false; };
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

        if (currentUser.avatarUrl) {
          const avatarUrl = normalizeMediaUrl(currentUser.avatarUrl);
          setProfileImage(avatarUrl);
          storeProfileAvatar(avatarUrl);
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

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ოპტიმისტური preview, სანამ backend პასუხობს.
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      // შევამციროთ, რომ ატვირთვის ლიმიტს არ გადავაჭარბოთ (413).
      const optimized = await resizeAvatar(file);
      const updated = await uploadProfileAvatar(optimized);
      if (updated?.avatarUrl) {
        const avatarUrl = normalizeMediaUrl(updated.avatarUrl);
        setProfileImage(avatarUrl);
        storeProfileAvatar(avatarUrl);
      }
      showToast("ფოტო აიტვირთა");
    } catch {
      showToast("ფოტოს ატვირთვა ვერ მოხერხდა", "error");
    } finally {
      // ერთი და იმავე ფაილის ხელახლა ასარჩევად input გავასუფთაოთ.
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteProfileAvatar();
      setProfileImage(null);
      storeProfileAvatar(null);
      showToast("ფოტო წაიშალა");
    } catch {
      showToast("ფოტოს წაშლა ვერ მოხერხდა", "error");
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
                  <img
                    src={profileImage}
                    alt="user"
                    className={styles.avatarPhoto}
                  />
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

              {profileImage && (
                <button
                  type="button"
                  className={styles.removeAvatar}
                  onClick={handleRemoveAvatar}
                >
                  ფოტოს წაშლა
                </button>
              )}
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
                avatar={profileImage}
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
