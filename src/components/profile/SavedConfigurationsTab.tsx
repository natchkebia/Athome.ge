"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SavedConfigurationsTab.module.scss";
import AtHomeLoader from "../shared/AtHomeLoader";
import { useToast } from "@/contexts/ToastContext";
import {
  addProfileConfiguratorBuildToCart,
  deleteProfileConfiguratorBuild,
  getProfileConfiguratorBuild,
  getProfileConfiguratorBuilds,
  type ConfiguratorSlot,
  type ProfileConfiguratorBuild,
} from "@/lib/api/configurator";
import type { ConfiguratorCategoryKey, SelectedConfiguratorProduct } from "@/components/configurator/configuratorTypes";
import { printConfiguration } from "@/lib/configurator/printConfiguration";
import { useCommerce } from "@/contexts/CommerceContext";

const SLOT_TO_CATEGORY: Record<ConfiguratorSlot, ConfiguratorCategoryKey> = {
  cpu: "processor",
  motherboard: "motherboard",
  ram: "ram",
  gpu: "gpu",
  psu: "psu",
  case: "case",
  cpuCooler: "cooler",
  liquidCooler: "cooler",
  storageDrive: "storageDrive",
  storageSsd: "storage",
  storageHdd: "drive",
  caseFan: "caseFan",
};

export default function SavedConfigurationsTab() {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshCart } = useCommerce();
  const [configurations, setConfigurations] = useState<ProfileConfiguratorBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getProfileConfiguratorBuilds()
      .then((items) => active && setConfigurations(items ?? []))
      .catch(() => active && showToast("შენახული სისტემები ვერ ჩაიტვირთა", "error"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [showToast]);

  const handleDelete = async (id: number) => {
    setBusyId(id);
    try {
      await deleteProfileConfiguratorBuild(id);
      setConfigurations((items) => items.filter((item) => item.id !== id));
      showToast("კონფიგურაცია წაიშალა");
    } catch {
      showToast("კონფიგურაციის წაშლა ვერ მოხერხდა", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (build: ProfileConfiguratorBuild) => {
    setBusyId(build.id);
    try {
      const result = await addProfileConfiguratorBuildToCart(build.id);
      if (result.skipped?.length) {
        showToast(
          `${result.addedCount} პროდუქტი დაემატა. ვერ დაემატა: ${result.skipped.map((item) => `${item.name} — ${item.reason}`).join(", ")}`,
          "error",
        );
      } else {
        showToast(`${result.addedCount} პროდუქტი დაემატა კალათაში`);
      }
      if (result.addedCount > 0) {
        // Bulk endpoint updates the profile cart on the backend. Refresh the
        // shared storefront cart as well, so the header and /basket show the
        // same products immediately without requiring a reload.
        await refreshCart();
        router.push("/basket");
      }
    } catch {
      showToast("კალათაში დამატება ვერ მოხერხდა", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (build: ProfileConfiguratorBuild) => {
    setBusyId(build.id);
    try {
      const details = await getProfileConfiguratorBuild(build.id);
      const selected: Record<string, SelectedConfiguratorProduct[]> = {};
      details.slots.forEach((slot) => {
        const category = SLOT_TO_CATEGORY[slot.slot];
        if (!category) return;
        selected[category] = [
          ...(selected[category] || []),
          {
            id: slot.productId,
            category,
            title: slot.productName || "პროდუქტი",
            image: slot.thumbnailUrl || "",
            price: slot.price,
            stock: slot.stockQuantity == null
              ? ((slot.stockStatus ?? "").toLowerCase().includes("out") ? 0 : 99)
              : Math.max(0, slot.stockQuantity),
            stockStatus: slot.stockStatus ?? undefined,
            specs: [],
            quantity: 1,
          },
        ];
      });
      if (!(await printConfiguration(selected, "ka"))) {
        showToast("კონფიგურაციაში ჩამოსატვირთი ნაწილები ვერ მოიძებნა", "error");
      }
    } catch {
      showToast("დოკუმენტის მომზადება ვერ მოხერხდა", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <AtHomeLoader variant="section" label="იტვირთება" />;

  if (configurations.length === 0) {
    return <div className={styles.empty}><p>თქვენ ჯერ არ გაქვთ შენახული სისტემები</p></div>;
  }

  return (
    <div className={styles.configurations}>
      <h2>ჩემი სისტემები</h2>
      <div className={styles.notice}>თქვენ გაქვთ დამატებული {configurations.length} სისტემა</div>

      {configurations.map((config) => (
        <div key={config.id} className={styles.configCard}>
          <div className={styles.infoTable}>
            <div><span>დასახელება</span><strong>{config.name}</strong></div>
            <div><span>კომპონენტები</span><strong>{config.itemCount}</strong></div>
            <div><span>დღევანდელი ღირებულება</span><strong>{config.totalPrice} ₾</strong></div>
            <div><span>დამატების თარიღი</span><strong>{new Date(config.createdAt).toLocaleString("ka-GE")}</strong></div>
            <div>
              <span>მიუწვდომელი ნაწილები</span>
              <strong>{config.unavailableCount}</strong>
            </div>
          </div>

          {config.unavailableCount > 0 && (
            <div className={styles.notice}>
              {config.unavailableCount} ნაწილი აღარ იყიდება და მიმდინარე ჯამში არ შედის.
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cartBtn} disabled={busyId === config.id} onClick={() => handleAddToCart(config)}>
              <img src="/images/systemBay.svg" alt="" /><span>კალათაში დამატება</span>
            </button>
            {config.shareUrl && (
              <button type="button" className={styles.viewBtn} onClick={() => router.push(config.shareUrl!)}>
                <img src="/images/systemAye.svg" alt="" /><span>კონფიგურაციის ნახვა</span>
              </button>
            )}
            <button type="button" className={styles.viewBtn} disabled={busyId === config.id} onClick={() => handleDownload(config)}>
              <span>PDF შეთავაზების ჩამოტვირთვა</span>
            </button>
            <button type="button" className={styles.deleteBtn} disabled={busyId === config.id} onClick={() => handleDelete(config.id)}>
              <img src="/images/systemDelete.svg" alt="" /><span>სისტემის წაშლა</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
