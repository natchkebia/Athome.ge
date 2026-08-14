"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Configurator.module.scss";
import {
  ConfiguratorCategoryKey,
  ConfiguratorProduct,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";
import {
  configuratorProducts,
  peripheralCategories,
  systemUnitCategories,
} from "./configuratorData";
import ConfiguratorCategoryCard from "./ConfiguratorCategoryCard";
import ConfiguratorProductModal from "./ConfiguratorProductModal";
import type { ProductSelectionResult } from "./ConfiguratorProductModal";
import ConfiguratorSummary from "./ConfiguratorSummary";
import Breadcrumb from "../ breadcrumb/Breadcrumb";
import { useCommerce } from "@/contexts/CommerceContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import {
  FRONTEND_TO_BACKEND_SLOT,
  PERIPHERAL_PARENT_CATEGORY,
  PERIPHERAL_SLUGS,
  checkConfiguratorBuild,
  getCategoryProductsBySlugs,
  getConfiguratorBuild,
  getConfiguratorSlotProducts,
  saveConfiguratorBuild,
  type ConfiguratorBuildSlot,
  type ConfiguratorBrandFacet,
  type ConfiguratorCheckResult,
  type ConfiguratorIssue,
  type ConfiguratorProductCard,
  type ConfiguratorSlot,
} from "@/lib/api/configurator";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

function translateCompatibilityIssue(issue: ConfiguratorIssue, en: boolean) {
  const values = (issue.message ?? "").match(/'([^']+)'/g)?.map((value) =>
    value.slice(1, -1),
  );

  switch (issue.ruleCode?.toUpperCase()) {
    case "SOCKET_MISMATCH":
      if (en) return values?.length && values.length >= 2
        ? `Processor socket “${values[0]}” does not match motherboard socket “${values[1]}”.`
        : "The processor and motherboard sockets do not match.";
      return values?.length && values.length >= 2
        ? `პროცესორის სოკეტი „${values[0]}“ დედაპლატის სოკეტს „${values[1]}“ არ ემთხვევა.`
        : "პროცესორისა და დედაპლატის სოკეტები ერთმანეთს არ ემთხვევა.";
    case "MEMORY_TYPE_MISMATCH":
    case "RAM_TYPE_MISMATCH":
      if (en) return values?.length && values.length >= 2
        ? `Memory type “${values[0]}” does not match motherboard type “${values[1]}”.`
        : "The selected memory is not compatible with the motherboard.";
      return values?.length && values.length >= 2
        ? `ოპერატიული მეხსიერების ტიპი „${values[0]}“ დედაპლატის ტიპს „${values[1]}“ არ ემთხვევა.`
        : "ოპერატიული მეხსიერების ტიპი დედაპლატასთან თავსებადი არ არის.";
    case "INSUFFICIENT_PSU_WATTAGE":
    case "PSU_WATTAGE_INSUFFICIENT":
      return en ? "The selected power supply does not provide enough wattage for this configuration." : "არჩეული კვების ბლოკის სიმძლავრე ამ კონფიგურაციისთვის საკმარისი არ არის.";
    case "FORM_FACTOR_MISMATCH":
    case "CASE_FORM_FACTOR_MISMATCH":
      return en ? "The motherboard form factor is not compatible with the selected case." : "დედაპლატის ზომა არჩეულ ქეისში თავსებადი არ არის.";
    case "COOLER_SOCKET_MISMATCH":
      return en ? "The CPU cooler is not compatible with the selected processor socket." : "პროცესორის ქულერი არჩეული პროცესორის სოკეტთან თავსებადი არ არის.";
    case "GPU_LENGTH_EXCEEDS_CASE":
      return en ? "The graphics card is too long for the selected case." : "ვიდეობარათის სიგრძე არჩეული ქეისისთვის ზედმეტად დიდია.";
    case "COOLER_HEIGHT_EXCEEDS_CASE":
      return en ? "The CPU cooler is too tall for the selected case." : "პროცესორის ქულერის სიმაღლე არჩეული ქეისისთვის ზედმეტად დიდია.";
    default:
      return en ? "This product is not compatible with the selected components." : "ეს პროდუქტი არჩეულ კომპონენტებთან თავსებადი არ არის.";
  }
}

type SelectedProducts = Partial<
  Record<ConfiguratorCategoryKey, SelectedConfiguratorProduct[]>
>;

type AlertState = {
  type: "warning" | "success";
  message: string;
} | null;

type GuestBuild = {
  token: string;
  name: string;
  expiresAt: string;
};

const GUEST_BUILDS_KEY = "athomeGuestConfiguratorBuilds";

const REQUIRED_SYSTEM_CATEGORIES: ConfiguratorCategoryKey[] = [
  "processor",
  "motherboard",
  "ram",
  "gpu",
  "psu",
  "case",
  "storage",
];

const EN_CATEGORY_TITLES: Record<ConfiguratorCategoryKey, string> = {
  processor: "Processor", motherboard: "Motherboard", ram: "Memory", gpu: "Graphics card",
  psu: "Power supply", cooler: "CPU cooler", case: "Case", drive: "Hard drive",
  storage: "SSD storage", storageDrive: "Storage", caseFan: "Case fan", os: "System license", monitor: "Monitor",
  headphones: "Headset", keyboard: "Keyboard", mouse: "Mouse", microphone: "Microphone",
  speaker: "Speakers",
};

// backend slot -> a representative frontend key (for reconstructing a loaded build)
const BACKEND_TO_FRONTEND_SLOT: Record<ConfiguratorSlot, ConfiguratorCategoryKey> =
  {
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

// Adapt a backend product card to the shape the existing modal/cards expect.
function adaptCard(
  card: ConfiguratorProductCard,
  category: ConfiguratorCategoryKey
): ConfiguratorProduct {
  const outOfStock = (card.stockStatus ?? "").toLowerCase().includes("out");
  const stock = card.stockQuantity == null
    ? (outOfStock ? 0 : 99)
    : Math.max(0, card.stockQuantity);
  return {
    id: card.id,
    category,
    title: card.name ?? "",
    image: normalizeMediaUrl(card.thumbnailUrl ?? undefined) || "/images/case.svg",
    price: card.effectivePrice,
    stock,
    stockStatus: card.stockStatus ?? undefined,
    hasOwnStock: card.hasOwnStock ?? undefined,
    brandName: card.brandName ?? undefined,
    brandSlug: card.brandSlug ?? undefined,
    compatibilityStatus: card.compatibilityStatus ?? undefined,
    specs: (card.keySpecs ?? []).map((spec) => ({
      label: spec.label ?? "",
      value: spec.value ?? "",
    })),
  };
}

export default function Configurator() {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, refreshCart } = useCommerce();

  const [selectedCategory, setSelectedCategory] =
    useState<ConfiguratorCategoryKey | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts>({});

  const [showPeripherals, setShowPeripherals] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const [modalProducts, setModalProducts] = useState<ConfiguratorProduct[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalBrands, setModalBrands] = useState<ConfiguratorBrandFacet[]>([]);
  const [selectedBrandSlugs, setSelectedBrandSlugs] = useState<string[]>([]);
  const [hiddenByCompatibility, setHiddenByCompatibility] = useState(0);
  const [modalTotalCount, setModalTotalCount] = useState(0);
  const [compatibilityFilterEnabled, setCompatibilityFilterEnabled] = useState(true);

  const [checkResult, setCheckResult] = useState<ConfiguratorCheckResult | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [guestBuilds, setGuestBuilds] = useState<GuestBuild[]>([]);
  const [lastGuestBuildToken, setLastGuestBuildToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const now = Date.now();
      const stored = JSON.parse(localStorage.getItem(GUEST_BUILDS_KEY) || "[]") as GuestBuild[];
      const active = Array.isArray(stored)
        ? stored.filter((item) => item.token && new Date(item.expiresAt).getTime() > now)
        : [];
      setGuestBuilds(active);
      localStorage.setItem(GUEST_BUILDS_KEY, JSON.stringify(active));
    } catch {
      setGuestBuilds([]);
    }
  }, []);

  const visibleCategories = showPeripherals
    ? peripheralCategories
    : systemUnitCategories;

  // Load products for the opened slot — real data for backend-mapped slots,
  // local fallback for slots the backend doesn't support yet (os, peripherals).
  useEffect(() => {
    if (!selectedCategory) return;

    const backendSlot = FRONTEND_TO_BACKEND_SLOT[selectedCategory];
    const isPeripheral = PERIPHERAL_SLUGS.has(selectedCategory);

    // slots the backend doesn't expose at all (e.g. os) → local fallback
    if (!backendSlot && !isPeripheral) {
      setModalProducts(
        configuratorProducts.filter((p) => p.category === selectedCategory)
      );
      setModalLoading(false);
      return;
    }

    let active = true;
    setModalLoading(true);
    setModalProducts([]);

    const selectedIds = compatibilityFilterEnabled
      ? (Object.keys(selectedProducts) as ConfiguratorCategoryKey[])
      // მიმდინარე სლოტის ძველი არჩევანი კანდიდატებს არ უნდა შეედაროს — ის ჩანაცვლდება.
      .filter((key) => key !== selectedCategory && Boolean(FRONTEND_TO_BACKEND_SLOT[key]))
          .flatMap((key) => selectedProducts[key]?.map((item) => item.id) ?? [])
      : [];
    const request = backendSlot
      ? getConfiguratorSlotProducts(backendSlot, {
          selectedIds,
          brandSlugs: selectedBrandSlugs,
          pageSize: 1000,
        })
      : getCategoryProductsBySlugs(PERIPHERAL_PARENT_CATEGORY, [
          selectedCategory,
        ]);

    request
      .then((response) => {
        if (!active) return;
        const items = Array.isArray(response) ? response : response.items;
        if (!Array.isArray(response)) {
          setModalBrands(response.brands ?? []);
          setHiddenByCompatibility(response.hiddenByCompatibility ?? 0);
          setModalTotalCount(response.totalCount ?? items.length);
        } else {
          setModalBrands([]);
          setHiddenByCompatibility(0);
          setModalTotalCount(items.length);
        }
        setModalProducts(
          (items ?? []).map((card) => adaptCard(card, selectedCategory))
        );
      })
      .catch(() => {
        if (active) setModalProducts([]);
      })
      .finally(() => {
        if (active) setModalLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, selectedBrandSlugs, selectedProducts, compatibilityFilterEnabled]);

  useEffect(() => {
    setSelectedBrandSlugs([]);
    setCompatibilityFilterEnabled(true);
  }, [selectedCategory]);

  const activeCategoryTitle = useMemo(() => {
    if (!selectedCategory) return "";
    const allCategories = [...systemUnitCategories, ...peripheralCategories];
    return (
      allCategories.find((category) => category.key === selectedCategory)
        ?.title || ""
    );
  }, [selectedCategory]);

  const allSelectedProducts = useMemo(() => {
    return Object.values(selectedProducts).flatMap(
      (categoryProducts) => categoryProducts || []
    );
  }, [selectedProducts]);

  const localTotalPrice = useMemo(() => {
    return allSelectedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  }, [allSelectedProducts]);

  const totalQuantity = useMemo(() => {
    return allSelectedProducts.reduce((sum, product) => sum + product.quantity, 0);
  }, [allSelectedProducts]);

  // Build the backend slots array (one product per backend slot).
  const backendSlots = useMemo<ConfiguratorBuildSlot[]>(() => {
    const slots: ConfiguratorBuildSlot[] = [];
    const seen = new Set<ConfiguratorSlot>();
    (Object.keys(selectedProducts) as ConfiguratorCategoryKey[]).forEach(
      (key) => {
        const backendSlot = FRONTEND_TO_BACKEND_SLOT[key];
        const first = selectedProducts[key]?.[0];
        if (backendSlot && first && !seen.has(backendSlot)) {
          seen.add(backendSlot);
          slots.push({ slot: backendSlot, productId: first.id });
        }
      }
    );
    return slots;
  }, [selectedProducts]);

  // Run compatibility check whenever the build changes (need ≥2 components).
  useEffect(() => {
    if (backendSlots.length < 2) {
      setCheckResult(null);
      return;
    }

    let active = true;
    checkConfiguratorBuild(backendSlots)
      .then((res) => {
        if (active) setCheckResult(res);
      })
      .catch(() => {
        if (active) setCheckResult(null);
      });

    return () => {
      active = false;
    };
  }, [backendSlots]);

  // Load a shared build from ?build=<token>.
  useEffect(() => {
    const token = searchParams.get("build");
    if (!token) return;

    getConfiguratorBuild(token)
      .then((build) => {
        const restored: SelectedProducts = {};
        build.slots.forEach((slot) => {
          const key = BACKEND_TO_FRONTEND_SLOT[slot.slot];
          if (!key) return;
          restored[key] = [
            {
              id: slot.productId,
              category: key,
              title: slot.productName ?? "",
              image: slot.thumbnailUrl || "/images/case.svg",
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
        setSelectedProducts(restored);
      })
      .catch(() => {});
  }, [searchParams]);

  const totalPrice = checkResult?.summary?.totalPrice ?? localTotalPrice;

  const getSafeQuantity = (product: ConfiguratorProduct, quantity: number) => {
    return product.stock > 0
      ? Math.min(Math.max(1, quantity), product.stock)
      : 1;
  };

  const handleSelectProduct = async (
    product: ConfiguratorProduct,
    quantity: number
  ): Promise<ProductSelectionResult> => {
    const safeQuantity = getSafeQuantity(product, quantity);

    const categoryProducts = selectedProducts[product.category] || [];
    const alreadySelected = categoryProducts.some(
      (item) => item.id === product.id
    );

    if (!alreadySelected && product.stock <= 0) {
      return {
        allowed: false,
        message: en ? "This product is out of stock." : "პროდუქტი მარაგში არ არის.",
      };
    }

    // უკვე არჩეულ პროდუქტზე დაჭერა წაშლაა და თავსებადობის შემოწმება არ სჭირდება.
    if (!alreadySelected) {
      const candidateSlot = FRONTEND_TO_BACKEND_SLOT[product.category];

      if (candidateSlot) {
        const candidateSlots = backendSlots.filter(
          (item) => item.slot !== candidateSlot
        );
        candidateSlots.push({ slot: candidateSlot, productId: product.id });

        // ერთი კომპონენტი ჯერ ვერავისთან იქნება შეუთავსებელი.
        if (candidateSlots.length >= 2) {
          try {
            const result = await checkConfiguratorBuild(candidateSlots);
            const isBlocked =
              result.verdict === "incompatible" ||
              result.blockingCount > 0 ||
              !result.isCompatible;

            if (isBlocked) {
              const message = result.allIssues
                .map((issue) => translateCompatibilityIssue(issue, en))
                .slice(0, 3)
                .join(" ");

              return {
                allowed: false,
                message:
                  message ||
                  (en ? "This product is not compatible with the selected components." : "ეს პროდუქტი არჩეულ კომპონენტებთან თავსებადი არ არის."),
              };
            }
          } catch {
            return {
              allowed: false,
              message: en
                ? "Compatibility check failed. Please try again."
                : "თავსებადობის შემოწმება ვერ მოხერხდა. გთხოვთ, კიდევ სცადოთ.",
            };
          }
        }
      }
    }

    setSelectedProducts((prev) => {
      const prevCategory = prev[product.category] || [];
      const isSelected = prevCategory.some((item) => item.id === product.id);

      if (isSelected) {
        return {
          ...prev,
          [product.category]: prevCategory.filter(
            (item) => item.id !== product.id
          ),
        };
      }

      // one product per slot — replace any previous selection in this category.
      // slot-ს ბოლო პოზიციაზე გადავიტანთ (key ხელახლა ემატება), რომ summary-ში
      // ბოლოს არჩეული კომპონენტი ყოველთვის ზემოთ გამოჩნდეს.
      const rest = { ...prev };
      delete rest[product.category];
      return {
        ...rest,
        [product.category]: [{ ...product, quantity: safeQuantity }],
      };
    });

    // ახალი კომპონენტის დამატებისას მოდალი თავისით დაიხუროს (წაშლისას/toggle-off არა)
    if (!alreadySelected) {
      setSelectedCategory(null);
    }

    return { allowed: true };
  };

  const handleUpdateQuantity = (
    product: ConfiguratorProduct,
    quantity: number
  ) => {
    const safeQuantity = getSafeQuantity(product, quantity);

    setSelectedProducts((prev) => {
      const categoryProducts = prev[product.category];
      if (!categoryProducts) return prev;

      return {
        ...prev,
        [product.category]: categoryProducts.map((item) =>
          item.id === product.id ? { ...item, quantity: safeQuantity } : item
        ),
      };
    });
  };

  const handleRemoveProduct = (category: ConfiguratorCategoryKey) => {
    setSelectedProducts((prev) => {
      const copied = { ...prev };
      delete copied[category];
      return copied;
    });
  };

  const handleClearConfiguration = () => {
    setSelectedProducts({});
    setCheckResult(null);
  };

  const handleSaveConfiguration = useCallback(async () => {
    const allCategories = [...systemUnitCategories, ...peripheralCategories];

    const missingCategories = REQUIRED_SYSTEM_CATEGORIES.filter((categoryKey) => {
      const categoryProducts = selectedProducts[categoryKey];
      return !categoryProducts || categoryProducts.length === 0;
    })
      .map((categoryKey) =>
        allCategories.find((category) => category.key === categoryKey)
      )
      .filter(Boolean);

    if (missingCategories.length > 0) {
      const missingNames = missingCategories
        .map((category) => en ? EN_CATEGORY_TITLES[category!.key] : category!.title)
        .join(", ");
      setAlert({
        type: "warning",
        message: en ? `Select the following required components before saving: ${missingNames}` : `სისტემის შესანახად სავალდებულოა შემდეგი კომპონენტების არჩევა: ${missingNames}`,
      });
      return;
    }

    setSaving(true);
    try {
      const buildName = `${en ? "Configuration" : "კონფიგურაცია"} ${new Date().toLocaleDateString(en ? "en-GB" : "ka-GE")}`;
      const result = await saveConfiguratorBuild(
        buildName,
        backendSlots
      );
      const shareUrl =
        result.shareUrl ||
        (result.shareToken
          ? `${window.location.origin}/configurator?build=${result.shareToken}`
          : "");
      if (result.savedToProfile === false && result.expiresAt && result.shareToken) {
        const guestBuild: GuestBuild = {
          token: result.shareToken,
          name: buildName,
          expiresAt: result.expiresAt,
        };
        setGuestBuilds((items) => {
          const next = [guestBuild, ...items.filter((item) => item.token !== guestBuild.token)];
          localStorage.setItem(GUEST_BUILDS_KEY, JSON.stringify(next));
          return next;
        });
        setLastGuestBuildToken(result.shareToken);
      } else {
        setLastGuestBuildToken(null);
      }
      setAlert({
        type: "success",
        message: result.savedToProfile === false && result.expiresAt
          ? en
            ? `Configuration saved for 24 hours. Sign in to keep it permanently.${shareUrl ? ` Share link: ${shareUrl}` : ""}`
            : `კონფიგურაცია 24 საათით შეინახა. მუდმივად შესანახად გაიარეთ ავტორიზაცია.${shareUrl ? ` გასაზიარებელი ბმული: ${shareUrl}` : ""}`
          : shareUrl
          ? en ? `Configuration saved. Share link: ${shareUrl}` : `კონფიგურაცია შენახულია. გასაზიარებელი ბმული: ${shareUrl}`
          : en ? "Configuration saved." : "კონფიგურაცია შენახულია.",
      });
    } catch {
      setAlert({
        type: "warning",
        message: en ? "Could not save the configuration. Please try again later." : "კონფიგურაციის შენახვა ვერ მოხერხდა. სცადეთ მოგვიანებით.",
      });
    } finally {
      setSaving(false);
    }
  }, [backendSlots, en, selectedProducts]);

  const handleAddToCart = useCallback(async () => {
    if (allSelectedProducts.length === 0) {
      setAlert({ type: "warning", message: en ? "Select components first." : "ჯერ აირჩიეთ კომპონენტები." });
      return;
    }
    setAddingToCart(true);
    try {
      for (const product of allSelectedProducts) {
        cacheProductInfo({
          productId: product.id,
          productName: product.title,
          imageUrl: product.image,
          sellingPrice: product.price,
          isInStock: product.stock > 0,
        });
        await addToCart(product.id, product.quantity || 1);
      }
      await refreshCart();
      router.push("/basket");
    } catch {
      setAlert({
        type: "warning",
        message: en ? "Could not add the configuration to the cart." : "კალათაში დამატება ვერ მოხერხდა.",
      });
    } finally {
      setAddingToCart(false);
    }
  }, [addToCart, allSelectedProducts, en, refreshCart, router]);

  const handleAddGuestBuildToCart = useCallback(async (token: string) => {
    setAddingToCart(true);
    try {
      const build = await getConfiguratorBuild(token);
      const availableSlots = build.slots.filter((slot) => {
        if (slot.stockQuantity != null) return slot.stockQuantity > 0;
        return !(slot.stockStatus ?? "").toLowerCase().includes("out");
      });

      for (const slot of availableSlots) {
        // CommerceContext automatically routes this to the authenticated
        // profile cart or the guest local cart, while keeping the normal
        // storefront basket/header state in sync.
        cacheProductInfo({
          productId: slot.productId,
          productName: slot.productName || (en ? "Configuration component" : "კონფიგურაციის კომპონენტი"),
          imageUrl: slot.thumbnailUrl || "",
          sellingPrice: slot.price,
          isInStock: true,
        });
        await addToCart(slot.productId, 1);
      }

      const skippedCount = build.slots.length - availableSlots.length;
      if (availableSlots.length === 0) {
        setAlert({
          type: "warning",
          message: en ? "No available products were found in this configuration." : "ამ კონფიგურაციაში ხელმისაწვდომი პროდუქტი ვერ მოიძებნა.",
        });
        return;
      }
      if (skippedCount > 0) {
        setAlert({
          type: "warning",
          message: en
            ? `${availableSlots.length} products were added. ${skippedCount} unavailable products were skipped.`
            : `${availableSlots.length} პროდუქტი დაემატა. ${skippedCount} მიუწვდომელი პროდუქტი გამოტოვებულია.`,
        });
      }
      await refreshCart();
      router.push("/basket");
    } catch {
      setAlert({
        type: "warning",
        message: en ? "Could not add the saved configuration to the cart." : "შენახული კონფიგურაციის კალათაში დამატება ვერ მოხერხდა.",
      });
    } finally {
      setAddingToCart(false);
    }
  }, [addToCart, en, refreshCart, router]);

  const handleDeleteGuestBuild = useCallback((token: string) => {
    setGuestBuilds((items) => {
      const next = items.filter((item) => item.token !== token);
      localStorage.setItem(GUEST_BUILDS_KEY, JSON.stringify(next));
      return next;
    });
    if (lastGuestBuildToken === token) setLastGuestBuildToken(null);
  }, [lastGuestBuildToken]);

  const breadcrumbs = en
    ? [{ label: "Home", href: "/" }, { label: "Configurator" }]
    : [{ label: "მთავარი გვერდი", href: "/" }, { label: "კონფიგურატორი" }];

  return (
    <>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb items={breadcrumbs} />
      </div>

      <main className={styles.configurator}>
        <div className={`site-wrapper ${styles.configuratorWrapper}`}>
          <div className={styles.layout}>
            <section className={styles.builder}>
              <div className={styles.toolbar}>
                <div className={styles.switchRow}>
                  <span className={!showPeripherals ? styles.activeLabel : ""}>
                    {en ? "System unit" : "სისტემური ბლოკი"}
                  </span>

                  <button
                    type="button"
                    className={`${styles.switch} ${
                      showPeripherals ? styles.switchActive : ""
                    }`}
                    onClick={() => setShowPeripherals((prev) => !prev)}
                    aria-label={en ? "Switch configurator type" : "კონფიგურატორის ტიპის შეცვლა"}
                  >
                    <span className={styles.switchThumb} />
                  </button>

                  <span className={showPeripherals ? styles.activeLabel : ""}>
                    {en ? "Monitor and peripherals" : "მონიტორი და პერიფერია"}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.resetViewBtn}
                  onClick={handleClearConfiguration}
                >
                  {en ? "Clear configuration" : "კონფიგურაციის გასუფთავება"}
                </button>
              </div>

              {checkResult && (
                <div
                  className={styles.compatBanner}
                  data-verdict={checkResult.verdict}
                >
                  <strong>
                    {checkResult.verdict === "compatible" &&
                      (en ? "✓ Components are compatible" : "✓ კომპონენტები თავსებადია")}
                    {checkResult.verdict === "hasWarnings" &&
                      (en ? "⚠ Compatible, with warnings" : "⚠ თავსებადია, მაგრამ არის გაფრთხილებები")}
                    {checkResult.verdict === "incompatible" &&
                      (en ? "✕ Components are not compatible" : "✕ კომპონენტები არ არის თავსებადი")}
                    {checkResult.verdict === "partialBuild" &&
                      (en ? "Configuration is incomplete" : "კონფიგურაცია არასრულია")}
                  </strong>
                  {checkResult.allIssues.length > 0 && (
                    <ul>
                      {checkResult.allIssues.slice(0, 5).map((issue, i) => (
                        <li key={i}>{translateCompatibilityIssue(issue, en)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className={styles.grid}>
                {visibleCategories.map((category) => (
                  <ConfiguratorCategoryCard
                    key={category.key}
                    category={category}
                    selectedProducts={selectedProducts[category.key] || []}
                    onClick={() => setSelectedCategory(category.key)}
                    onRemove={() => handleRemoveProduct(category.key)}
                  />
                ))}
              </div>
            </section>

            <ConfiguratorSummary
              showPeripherals={showPeripherals}
              selectedProducts={selectedProducts}
              totalPrice={totalPrice}
              onSaveConfiguration={handleSaveConfiguration}
              onAddToCart={handleAddToCart}
              saving={saving}
              addingToCart={addingToCart}
              guestBuilds={guestBuilds}
              onOpenGuestBuild={(token) => router.push(`/configurator?build=${encodeURIComponent(token)}`)}
              onAddGuestBuildToCart={handleAddGuestBuildToCart}
              onDeleteGuestBuild={handleDeleteGuestBuild}
            />
          </div>
        </div>

        {selectedCategory && (
          <ConfiguratorProductModal
            title={selectedCategory && en ? EN_CATEGORY_TITLES[selectedCategory] : activeCategoryTitle || (en ? "Details" : "დეტალები")}
            products={modalProducts}
            loading={modalLoading}
            selectedProducts={selectedProducts[selectedCategory] || []}
            onClose={() => setSelectedCategory(null)}
            onSelect={handleSelectProduct}
            onUpdateQuantity={handleUpdateQuantity}
            brands={modalBrands}
            selectedBrandSlugs={selectedBrandSlugs}
            onBrandSlugsChange={setSelectedBrandSlugs}
            hiddenByCompatibility={hiddenByCompatibility}
            totalCount={modalTotalCount}
            onClearCompatibilityFilter={() => setCompatibilityFilterEnabled(false)}
          />
        )}

        {alert && (
          <div className={styles.alertOverlay}>
            <div className={styles.alertModal}>
              <button
                type="button"
                className={styles.alertClose}
                onClick={() => setAlert(null)}
                aria-label={en ? "Close" : "დახურვა"}
              >
                ×
              </button>

              <img
                src={
                  alert.type === "warning"
                    ? "/images/warning.svg"
                    : "/images/save.svg"
                }
                alt={alert.type}
                className={styles.alertIcon}
              />

              <p>
                {alert.message}

                {alert.type === "success" && (
                  <>
                    {" "}
                    <button
                      type="button"
                      className={styles.alertLink}
                      onClick={() =>
                        router.push(
                          lastGuestBuildToken
                            ? `/configurator?build=${encodeURIComponent(lastGuestBuildToken)}`
                            : "/profile?tab=configurations",
                        )
                      }
                    >
                      {lastGuestBuildToken
                        ? (en ? "Open configuration" : "კონფიგურაციის გახსნა")
                        : (en ? "View saved configurations" : "შენახულ სისტემებში ნახვა")}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
