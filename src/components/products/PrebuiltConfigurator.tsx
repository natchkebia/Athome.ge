"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConfiguratorProductModal, { type ProductSelectionResult } from "@/components/configurator/ConfiguratorProductModal";
import type { ConfiguratorCategoryKey, ConfiguratorProduct, SelectedConfiguratorProduct } from "@/components/configurator/configuratorTypes";
import type { DynamicFilterValues } from "@/components/products/DynamicProductFilter";
import { useCommerce } from "@/contexts/CommerceContext";
import {
  getConfiguratorSlotProducts,
  type ConfiguratorBrandFacet,
  type ConfiguratorSlot,
} from "@/lib/api/configurator";
import type { StorefrontCategoryFilter } from "@/lib/api/storefront";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
import { resolveStockShortfallPart } from "@/lib/commerce/stockShortfall";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import {
  getPrebuiltConfiguration,
  getPrebuiltSlotOptions,
  quotePrebuiltConfiguration,
  type PrebuiltConfiguration,
  type PrebuiltPart,
  type PrebuiltQuote,
  type PrebuiltSwap,
} from "@/lib/api/prebuilt";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { printConfiguration } from "@/lib/configurator/printConfiguration";
import { img, imgSrcset } from "@/lib/media/img";
import styles from "./ProductDetail.module.scss";

const EMPTY_FILTERS: DynamicFilterValues = { price: [0, 0], brandSlugs: [], inStockOnly: true, attributes: {}, ranges: {} };
const SLOT_CATEGORY: Record<string, ConfiguratorCategoryKey> = {
  cpu: "processor", motherboard: "motherboard", ram: "ram", gpu: "gpu", psu: "psu",
  case: "case", cpuaircooler: "cooler", cpucooler: "cooler", liquidcooler: "liquidCooler",
  storagessd: "storage", storagehdd: "drive", storagedrive: "storageDrive", casefan: "caseFan",
};

const categoryForSlot = (slot: string) => SLOT_CATEGORY[slot.toLocaleLowerCase()] ?? `backend:${slot}`;
const backendSlotForPart = (slot: string): ConfiguratorSlot | null => {
  const normalized = slot.toLocaleLowerCase();
  const match = ({
    cpu: "cpu", motherboard: "motherboard", ram: "ram", gpu: "gpu", psu: "psu",
    case: "case", cpuaircooler: "cpuCooler", cpucooler: "cpuCooler",
    liquidcooler: "liquidCooler", storagedrive: "storageDrive",
    storagessd: "storageSsd", storagehdd: "storageHdd", casefan: "caseFan",
  } as Record<string, ConfiguratorSlot>)[normalized];
  return match ?? null;
};

type Props = {
  productId: number;
  onConfiguredPrice?: (price: number | null) => void;
  onQuotedPartsChange?: (parts: PrebuiltPart[] | null) => void;
};

export default function PrebuiltConfigurator({ productId, onConfiguredPrice, onQuotedPartsChange }: Props) {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingCart = searchParams.get("editingCart") === "1";
  const requestedSlot = searchParams.get("slot");
  const autoOpenedSlot = useRef<string | null>(null);
  const { cart, addToCart, refreshCart, replaceCartConfiguration } = useCommerce();
  const [base, setBase] = useState<PrebuiltConfiguration | null>(null);
  const [quote, setQuote] = useState<PrebuiltQuote | null>(null);
  const [swapsBySlot, setSwapsBySlot] = useState<Record<string, number>>({});
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [allOptions, setAllOptions] = useState<ConfiguratorProduct[]>([]);
  const [options, setOptions] = useState<ConfiguratorProduct[]>([]);
  const [brands, setBrands] = useState<ConfiguratorBrandFacet[]>([]);
  const [filters, setFilters] = useState<StorefrontCategoryFilter[]>([]);
  const [hidden, setHidden] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [filteringOptions, setFilteringOptions] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [message, setMessage] = useState("");
  const [filterValues, setFilterValues] = useState(EMPTY_FILTERS);

  useEffect(() => {
    let active = true;
    getPrebuiltConfiguration(productId).then((result) => {
      if (!active) return;
      setBase(result);
      const configured = cart.items.find((item) => item.productId === productId && item.isConfigured);
      if (configured?.swaps?.length) {
        void quotePrebuiltConfiguration(productId, configured.swaps).then((savedQuote) => {
          if (!active) return;
          setQuote(savedQuote);
          const baseIds = new Set(result.parts.map((part) => part.productId));
          const next: Record<string, number> = {};
          savedQuote.parts.forEach((part) => { if (!baseIds.has(part.productId)) next[part.slot] = part.productId; });
          setSwapsBySlot(next);
        });
        return;
      }
      if (configured?.configuredParts?.length) {
        const baseIds = new Set(result.parts.map((part) => part.productId));
        const existingSwaps = configured.configuredParts
          .filter((part) => !baseIds.has(part.productId))
          .map((part) => ({ componentProductId: part.productId }));
        if (existingSwaps.length) {
          void quotePrebuiltConfiguration(productId, existingSwaps).then((savedQuote) => {
            if (!active) return;
            setQuote(savedQuote);
            const next: Record<string, number> = {};
            savedQuote.parts.forEach((part) => { if (!baseIds.has(part.productId)) next[part.slot] = part.productId; });
            setSwapsBySlot(next);
          });
        }
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [cart.items, productId]);

  useEffect(() => onConfiguredPrice?.(quote?.price ?? null), [onConfiguredPrice, quote?.price]);
  useEffect(() => {
    onQuotedPartsChange?.(quote?.parts ?? null);
  }, [onQuotedPartsChange, quote?.parts]);

  useEffect(() => () => onQuotedPartsChange?.(null), [onQuotedPartsChange]);

  const parts = useMemo(() => quote?.parts ?? base?.parts ?? [], [base?.parts, quote?.parts]);
  const swaps = useMemo<PrebuiltSwap[]>(
    () => Object.values(swapsBySlot).map((componentProductId) => ({ componentProductId })),
    [swapsBySlot],
  );

  const openOptions = useCallback(async (part: PrebuiltPart) => {
    setMessage("");
    setOpenSlot(part.slot);
    setLoadingOptions(true);
    setAllOptions([]);
    setOptions([]);
    setBrands([]);
    setFilters([]);
    setFilterValues(EMPTY_FILTERS);
    try {
      const result = await getPrebuiltSlotOptions(productId, part.slot);
      setHidden(result.hiddenByCompatibility ?? 0);
      const mapped = result.options.map(({ product, priceDelta, newPrice }) => ({
        id: product.id,
        category: categoryForSlot(part.slot),
        title: product.name ?? "",
        image: normalizeMediaUrl(product.thumbnailUrl ?? undefined) || "/images/case.webp",
        price: product.effectivePrice,
        stock: Math.max(0, product.stockQuantity ?? 0),
        stockStatus: product.stockStatus ?? undefined,
        hasOwnStock: product.hasOwnStock ?? undefined,
        compatibilityStatus: product.compatibilityStatus ?? undefined,
        specs: (product.keySpecs ?? []).map((spec) => ({ label: spec.label ?? "", value: spec.value ?? "" })),
        priceDelta,
        configuredPrice: newPrice,
      }));
      setAllOptions(mapped);
      setOptions(mapped);
    } finally { setLoadingOptions(false); }
  }, [productId]);

  useEffect(() => {
    if (!openSlot || allOptions.length === 0) return;
    const backendSlot = backendSlotForPart(openSlot);
    if (!backendSlot) return;

    let active = true;
    setFilteringOptions(true);
    const [minimum, maximum] = filterValues.price;
    void getConfiguratorSlotProducts(backendSlot, {
      brandSlugs: filterValues.brandSlugs,
      minPrice: minimum > 0 ? minimum : undefined,
      maxPrice: maximum > 0 ? maximum : undefined,
      attributes: filterValues.attributes,
      ranges: filterValues.ranges,
      inStockOnly: true,
      pageSize: 1000,
    }).then((result) => {
      if (!active) return;
      const visibleIds = new Set(result.items.map((item) => item.id));
      setOptions(allOptions.filter((option) => visibleIds.has(option.id)));
      setBrands(result.brands);
      setFilters(result.filters);
    }).catch(() => {
      if (active) setOptions(allOptions);
    }).finally(() => {
      if (active) setFilteringOptions(false);
    });

    return () => { active = false; };
  }, [allOptions, filterValues, openSlot]);

  useEffect(() => {
    if (!requestedSlot || autoOpenedSlot.current === requestedSlot || parts.length === 0) return;
    const target = parts.find((part) => part.slot.toLocaleLowerCase() === requestedSlot.toLocaleLowerCase());
    if (!target) return;
    autoOpenedSlot.current = requestedSlot;
    void openOptions(target);
  }, [openOptions, parts, requestedSlot]);

  const chooseOption = async (product: ConfiguratorProduct): Promise<ProductSelectionResult> => {
    if (!openSlot) return { allowed: false };
    const replacedPartProductId = parts.find((part) => part.slot === openSlot)?.productId;
    const next = { ...swapsBySlot, [openSlot]: product.id };
    const nextSwaps = Object.values(next).map((componentProductId) => ({ componentProductId }));
    try {
      const result = await quotePrebuiltConfiguration(productId, nextSwaps);
      if ((result.blockingIssues ?? []).length > 0) {
        setQuote(result);
        return {
          allowed: false,
          message: result.blockingIssues
            .map((issue) => issue.message ?? issue.detail ?? issue.ruleCode)
            .filter(Boolean)
            .join(" "),
        };
      }
      setSwapsBySlot(next);
      setQuote(result);
      setOpenSlot(null);
      if (editingCart) {
        setBusy(true);
        await replaceCartConfiguration(productId, nextSwaps, {
          price: result.price,
          parts: result.parts.map((part) => ({
            productId: part.productId,
            name: part.productName,
            quantity: part.quantity,
          })),
        });
        if (replacedPartProductId) resolveStockShortfallPart(productId, replacedPartProductId);
        setMessage(en ? "The cart configuration was updated." : "კალათაში კონფიგურაცია განახლდა.");
        router.push("/basket");
      }
      return { allowed: true };
    } catch (error) {
      return { allowed: false, message: error instanceof Error ? error.message : (en ? "This part cannot be selected." : "ამ ნაწილის არჩევა შეუძლებელია.") };
    } finally {
      if (editingCart) setBusy(false);
    }
  };

  const addConfigured = async () => {
    if (!base || swaps.length === 0 || (quote?.blockingIssues.length ?? 0) > 0) return;
    const existing = cart.items.some((item) => item.productId === productId);
    if (existing && !window.confirm(en ? "This will replace the configuration already in your cart. Continue?" : "კალათაში არსებული ამ კომპიუტერის კონფიგურაცია ჩანაცვლდება. გავაგრძელოთ?")) return;
    setBusy(true);
    try {
      cacheProductInfo({
        productId,
        productName: quote?.parts.map((part) => part.productName).join(" / ") || base.name,
        sellingPrice: quote?.price ?? base.basePrice,
        isInStock: (quote?.buildableUnits ?? base.buildableUnits) > 0,
      });
      await addToCart(productId, 1, swaps);
      await refreshCart();
      setMessage(en ? "Configured PC added to cart." : "შეცვლილი კონფიგურაცია კალათაში დაემატა.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (en ? "Could not add the configuration." : "კონფიგურაციის დამატება ვერ მოხერხდა."));
    } finally { setBusy(false); }
  };

  const downloadInvoice = async () => {
    if (parts.length === 0 || blocking.length > 0) return;
    setDownloadingInvoice(true);
    try {
      const selectedProducts = parts.reduce<Record<string, SelectedConfiguratorProduct[]>>((result, part) => {
        const category = categoryForSlot(part.slot);
        const item: SelectedConfiguratorProduct = {
          id: part.productId,
          category,
          title: part.productName,
          image: normalizeMediaUrl(part.thumbnailUrl ?? undefined) || "/images/case.webp",
          price: part.unitPrice,
          stock: Math.max(0, part.available),
          specs: [],
          quantity: part.quantity,
        };
        result[category] = [...(result[category] ?? []), item];
        return result;
      }, {});
      await printConfiguration(selectedProducts, en ? "en" : "ka");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (!base || base.parts.length === 0) return null;
  const blocking = quote?.blockingIssues ?? [];
  const bounds: [number, number] = allOptions.length ? [Math.floor(Math.min(...allOptions.map((item) => item.price))), Math.ceil(Math.max(...allOptions.map((item) => item.price)))] : [0, 0];

  return <section className={styles.prebuiltConfigurator}>
    {editingCart && (
      <div className={styles.prebuiltEditingNotice} role="status">
        <span aria-hidden="true">↻</span>
        <div>
          <strong>{en ? "Editing the computer in your cart" : "კალათაში არსებული კომპიუტერის ამოცვლა"}</strong>
          <p>{en ? "Choose a component and its replacement. The new configuration will replace the current one in the cart." : "აირჩიეთ კომპონენტი და მისი შემცვლელი — ახალი კონფიგურაცია კალათაში არსებულს ჩაანაცვლებს."}</p>
        </div>
      </div>
    )}
    <div className={styles.prebuiltHeader}>
      <div><h3>{en ? "Customize this PC" : "მზა კომპიუტერის კონფიგურაცია"}</h3></div>
    </div>
    <div className={styles.prebuiltParts}>{parts.map((part, index) => <div key={`${part.slot}-${part.productId}-${index}`} className={styles.prebuiltPart}>
      <img
        src={img(normalizeMediaUrl(part.thumbnailUrl ?? undefined) || "/images/case.webp", 100)}
        srcSet={imgSrcset(normalizeMediaUrl(part.thumbnailUrl ?? undefined), 100) || undefined}
        loading="lazy"
        decoding="async"
        alt=""
      />
      <div><small>{part.slot}</small><strong>{part.productName}</strong><span>{part.quantity} × {part.unitPrice.toFixed(2)} ₾</span></div>
      {part.isSwappable && <button type="button" onClick={() => void openOptions(part)}>{en ? "Change" : "შეცვლა"}</button>}
    </div>)}</div>
    {blocking.length > 0 && <div className={styles.prebuiltBlocking}><strong>{en ? "This configuration cannot be built" : "ეს კონფიგურაცია ვერ იწყობა"}</strong>{blocking.map((issue, index) => <p key={index}>{issue.message ?? issue.detail ?? issue.ruleCode}</p>)}</div>}
    {message && <p className={styles.prebuiltMessage}>{message}</p>}
    <div className={styles.prebuiltActions}>
      <button className={styles.prebuiltInvoiceButton} type="button" disabled={downloadingInvoice || blocking.length > 0} onClick={() => void downloadInvoice()}>
        <img src="/images/conf2.svg" alt="" />
        {downloadingInvoice ? (en ? "Downloading..." : "იტვირთება...") : (en ? "Download invoice" : "ინვოისის გადმოწერა")}
      </button>
      {!editingCart && swaps.length > 0 && <button className={styles.prebuiltCartButton} type="button" disabled={busy || blocking.length > 0 || (quote?.buildableUnits ?? 0) <= 0} onClick={() => void addConfigured()}>{busy ? (en ? "Adding..." : "ემატება...") : (en ? "Add configured PC to cart" : "შეცვლილი კომპიუტერის კალათაში დამატება")}</button>}
    </div>
    {openSlot && <ConfiguratorProductModal categoryKey={categoryForSlot(openSlot)} title={en ? `Change ${openSlot}` : `${openSlot} — ნაწილის შეცვლა`} products={options} loading={loadingOptions || filteringOptions || busy} selectedProducts={[]} onClose={() => setOpenSlot(null)} onSelect={chooseOption} onUpdateQuantity={() => {}} brands={brands} filters={filters} filterValues={filterValues} priceBounds={bounds} onFilterValuesChange={setFilterValues} hiddenByCompatibility={hidden} totalCount={options.length} />}
  </section>;
}
