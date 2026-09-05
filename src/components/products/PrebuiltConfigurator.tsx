"use client";

import { useEffect, useMemo, useState } from "react";
import ConfiguratorProductModal, { type ProductSelectionResult } from "@/components/configurator/ConfiguratorProductModal";
import type { ConfiguratorCategoryKey, ConfiguratorProduct } from "@/components/configurator/configuratorTypes";
import type { DynamicFilterValues } from "@/components/products/DynamicProductFilter";
import { useCommerce } from "@/contexts/CommerceContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
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
import styles from "./ProductDetail.module.scss";

const EMPTY_FILTERS: DynamicFilterValues = { price: [0, 0], brandSlugs: [], inStockOnly: true, attributes: {}, ranges: {} };
const SLOT_CATEGORY: Record<string, ConfiguratorCategoryKey> = {
  Cpu: "processor", Motherboard: "motherboard", Ram: "ram", Gpu: "gpu", Psu: "psu",
  Case: "case", CpuCooler: "cooler", LiquidCooler: "liquidCooler", StorageSsd: "storage",
  StorageHdd: "drive", CaseFan: "caseFan",
};

type Props = {
  productId: number;
  onConfiguredPrice?: (price: number | null) => void;
  onQuotedPartsChange?: (parts: PrebuiltPart[] | null) => void;
};

export default function PrebuiltConfigurator({ productId, onConfiguredPrice, onQuotedPartsChange }: Props) {
  const en = useStorefrontLocale() === "en";
  const { cart, addToCart, refreshCart } = useCommerce();
  const [base, setBase] = useState<PrebuiltConfiguration | null>(null);
  const [quote, setQuote] = useState<PrebuiltQuote | null>(null);
  const [swapsBySlot, setSwapsBySlot] = useState<Record<string, number>>({});
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [options, setOptions] = useState<ConfiguratorProduct[]>([]);
  const [hidden, setHidden] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [busy, setBusy] = useState(false);
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

  const parts = quote?.parts ?? base?.parts ?? [];
  const swaps = useMemo<PrebuiltSwap[]>(
    () => Object.values(swapsBySlot).map((componentProductId) => ({ componentProductId })),
    [swapsBySlot],
  );

  const openOptions = async (part: PrebuiltPart) => {
    setMessage("");
    setOpenSlot(part.slot);
    setLoadingOptions(true);
    setOptions([]);
    setFilterValues(EMPTY_FILTERS);
    try {
      const result = await getPrebuiltSlotOptions(productId, part.slot);
      setHidden(result.hiddenByCompatibility ?? 0);
      setOptions(result.options.map(({ product, priceDelta, newPrice }) => ({
        id: product.id,
        category: SLOT_CATEGORY[part.slot] ?? "storageDrive",
        title: product.name ?? "",
        image: normalizeMediaUrl(product.thumbnailUrl ?? undefined) || "/images/case.svg",
        price: product.effectivePrice,
        stock: Math.max(0, product.stockQuantity ?? 0),
        stockStatus: product.stockStatus ?? undefined,
        hasOwnStock: product.hasOwnStock ?? undefined,
        compatibilityStatus: product.compatibilityStatus ?? undefined,
        specs: (product.keySpecs ?? []).map((spec) => ({ label: spec.label ?? "", value: spec.value ?? "" })),
        priceDelta,
        configuredPrice: newPrice,
      })));
    } finally { setLoadingOptions(false); }
  };

  const chooseOption = async (product: ConfiguratorProduct): Promise<ProductSelectionResult> => {
    if (!openSlot) return { allowed: false };
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
      return { allowed: true };
    } catch (error) {
      return { allowed: false, message: error instanceof Error ? error.message : (en ? "This part cannot be selected." : "ამ ნაწილის არჩევა შეუძლებელია.") };
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

  if (!base || base.parts.length === 0) return null;
  const blocking = quote?.blockingIssues ?? [];
  const priceDelta = quote?.priceDelta ?? 0;
  const bounds: [number, number] = options.length ? [Math.floor(Math.min(...options.map((item) => item.price))), Math.ceil(Math.max(...options.map((item) => item.price)))] : [0, 0];

  return <section className={styles.prebuiltConfigurator}>
    <div className={styles.prebuiltHeader}>
      <div><h3>{en ? "Customize this PC" : "მზა კომპიუტერის კონფიგურაცია"}</h3><p>{en ? `Can currently build ${quote?.buildableUnits ?? base.buildableUnits}` : `ამჟამად იწყობა: ${quote?.buildableUnits ?? base.buildableUnits} ცალი`}</p></div>
      <strong>{(quote?.price ?? base.basePrice).toFixed(2)} ₾</strong>
    </div>
    {priceDelta !== 0 && <div className={priceDelta < 0 ? styles.prebuiltSaving : styles.prebuiltIncrease}>{priceDelta > 0 ? "+" : ""}{priceDelta.toFixed(2)} ₾</div>}
    <div className={styles.prebuiltParts}>{parts.map((part) => <div key={part.slot} className={styles.prebuiltPart}>
      <img src={normalizeMediaUrl(part.thumbnailUrl ?? undefined) || "/images/case.svg"} alt="" />
      <div><small>{part.slot}</small><strong>{part.productName}</strong><span>{part.quantity} × {part.unitPrice.toFixed(2)} ₾</span></div>
      {part.isSwappable && <button type="button" onClick={() => void openOptions(part)}>{en ? "Change" : "შეცვლა"}</button>}
    </div>)}</div>
    {blocking.length > 0 && <div className={styles.prebuiltBlocking}><strong>{en ? "This configuration cannot be built" : "ეს კონფიგურაცია ვერ იწყობა"}</strong>{blocking.map((issue, index) => <p key={index}>{issue.message ?? issue.detail ?? issue.ruleCode}</p>)}</div>}
    {message && <p className={styles.prebuiltMessage}>{message}</p>}
    {swaps.length > 0 && <button className={styles.prebuiltCartButton} type="button" disabled={busy || blocking.length > 0 || (quote?.buildableUnits ?? 0) <= 0} onClick={() => void addConfigured()}>{busy ? (en ? "Adding..." : "ემატება...") : (en ? "Add configured PC to cart" : "შეცვლილი კომპიუტერის კალათაში დამატება")}</button>}
    {openSlot && <ConfiguratorProductModal title={en ? `Change ${openSlot}` : `${openSlot} — ნაწილის შეცვლა`} products={options} loading={loadingOptions} selectedProducts={[]} onClose={() => setOpenSlot(null)} onSelect={chooseOption} onUpdateQuantity={() => {}} brands={[]} filters={[]} filterValues={filterValues} priceBounds={bounds} onFilterValuesChange={setFilterValues} hiddenByCompatibility={hidden} totalCount={options.length} />}
  </section>;
}
