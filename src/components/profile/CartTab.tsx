"use client";

import styles from "./CartTab.module.scss";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { getPrebuiltConfiguration, quotePrebuiltConfiguration } from "@/lib/api/prebuilt";
import { getStorefrontProduct, getStorefrontProducts } from "@/lib/api/storefront";
import { clearCartReplacement, writeCartReplacement } from "@/lib/commerce/cartReplacement";
import {
  clearStockShortfalls,
  readStockShortfalls,
  type StockShortfallState,
  writeStockShortfalls,
} from "@/lib/commerce/stockShortfall";

interface CartTabProps {
  showSummary?: boolean;
}

export type CartItem = {
  id: number;
  title: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  isInStock: boolean;
  availableQuantity?: number;
  isSystem?: boolean;
  isPrebuilt?: boolean;
  slug?: string;
  systemProducts?: {
    id: number;
    title: string;
    image?: string;
    price?: number;
    quantity: number;
  }[];
};

export default function CartTab({ showSummary = true }: CartTabProps) {
  const en = useStorefrontLocale() === "en";
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);
  const [stockIssues, setStockIssues] = useState<StockShortfallState | null>(null);
  const [resolvingPartId, setResolvingPartId] = useState<number | null>(null);
  const [stockIssueError, setStockIssueError] = useState("");
  const [replacementError, setReplacementError] = useState("");
  const [openingReplacementId, setOpeningReplacementId] = useState<number | null>(null);
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCommerce();

  useEffect(() => setStockIssues(readStockShortfalls()), []);
  const cartItems: CartItem[] = cart.items
    .map((item) => ({
      id: item.productId,
      title: item.productName || item.productSku || (en ? `Product #${item.productId}` : `პროდუქტი #${item.productId}`),
      image: normalizeMediaUrl(item.imageUrl),
      price: item.unitPrice ?? item.sellingPrice,
      oldPrice: item.compareAtPrice ?? item.oldPrice,
      quantity: item.quantity,
      isInStock: item.isInStock !== false,
      availableQuantity: item.availableQuantity,
      isSystem: item.isConfigured,
      isPrebuilt: Boolean(item.isConfigured || item.configuredParts?.length || /^athomepc\b/i.test(item.productName ?? "")),
      slug: item.slug,
      systemProducts: item.configuredParts?.map((part) => ({
        id: part.productId,
        title: part.name,
        quantity: part.quantity,
      })),
    }));

  const increase = (id: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    updateCartQuantity(id, (item?.quantity ?? 0) + 1);
  };

  const decrease = (id: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === id);
    updateCartQuantity(id, Math.max((item?.quantity ?? 1) - 1, 1));
  };

  const resolveStockIssue = (productId: number) => {
    if (!stockIssues) return;
    const remaining = stockIssues.shortfalls.filter((issue) => issue.productId !== productId);
    if (remaining.length === 0) {
      clearStockShortfalls();
      setStockIssues(null);
      return;
    }
    const next = { ...stockIssues, shortfalls: remaining };
    writeStockShortfalls(next);
    setStockIssues(next);
  };

  const fixOrdinaryStock = async (productId: number, available: number) => {
    if (available > 0) await updateCartQuantity(productId, available);
    else await removeFromCart(productId);
    resolveStockIssue(productId);
  };

  const startPartReplacement = async (productId: number, partProductId: number) => {
    setStockIssueError("");
    setResolvingPartId(partProductId);
    try {
      const cartItem = cart.items.find((item) => item.productId === productId);
      const composition = cartItem?.swaps?.length
        ? await quotePrebuiltConfiguration(productId, cartItem.swaps)
        : await getPrebuiltConfiguration(productId);
      const part = composition.parts.find((candidate) => candidate.productId === partProductId);
      if (!part) throw new Error(en ? "The component slot could not be identified." : "კომპონენტის სლოტი ვერ განისაზღვრა.");
      router.push(`/prebuilt/${productId}?editingCart=1&slot=${encodeURIComponent(part.slot)}`);
    } catch (error) {
      setStockIssueError(error instanceof Error ? error.message : (en ? "The replacement list could not be opened." : "ჩანაცვლების სია ვერ გაიხსნა."));
    } finally {
      setResolvingPartId(null);
    }
  };

  const startCartItemReplacement = async (item: CartItem) => {
    if (item.isPrebuilt) {
      router.push(`/prebuilt/${item.id}?editingCart=1`);
      return;
    }

    setReplacementError("");
    setOpeningReplacementId(item.id);
    try {
      writeCartReplacement({ productId: item.id, productName: item.title });
      const product = item.slug
        ? await getStorefrontProduct(item.slug)
        : (await getStorefrontProducts({ search: item.title, pageSize: 100 })).items.find((candidate) => candidate.id === item.id);
      if (!product) throw new Error(en ? "The product category could not be identified." : "პროდუქტის კატეგორია ვერ განისაზღვრა.");
      const categorySlug = product.subCategory?.slug || product.category.slug;
      router.push(`/products/${encodeURIComponent(categorySlug)}?replaceCartProductId=${item.id}`);
    } catch (error) {
      clearCartReplacement();
      setReplacementError(error instanceof Error ? error.message : (en ? "The replacement list could not be opened." : "ამოცვლის სია ვერ გაიხსნა."));
    } finally {
      setOpeningReplacementId(null);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hasUnavailableItems = cartItems.some(
    (item) => !item.isInStock ||
      (item.availableQuantity != null && item.quantity > item.availableQuantity)
  );

  const handleContinue = () => {
    setIsContinuing(true);
    router.push("/delivery");
  };

  return (
    <div className={styles.cartSection}>
      {cartItems.length === 0 ? (
        <h4>{en ? "My cart" : "ჩემი კალათა"}</h4>
      ) : (
        <>
          <div className={styles.titleWrapper}>
            <h4>{en ? "My cart" : "ჩემი კალათა"}</h4>
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={clearCart}
            >
              <img src="/icons/broom.svg" alt="broom" />
              {en ? "Remove all" : "ყველა წაშლა"}
            </button>
          </div>

          {stockIssues && (
            <div className={styles.stockIssueSummary} role="alert">
              <strong>{en ? "The cart needs an update" : "კალათაში ცვლილებაა საჭირო"}</strong>
              <span>{stockIssues.detail}</span>
            </div>
          )}

          <div className={styles.cartList}>
            {cartItems.map((item) => {
              const stockIssue = stockIssues?.shortfalls.find((issue) => issue.productId === item.id);
              return (
              <div className={styles.cartItemGroup} key={item.id}>
              <div className={`${styles.cartCard} ${stockIssue ? styles.cartCardStockIssue : ""}`}>
                <div className={styles.left}>
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.fallback) return;
                      image.dataset.fallback = "true";
                      image.src = "/icons/Logo.svg";
                    }}
                  />

                  <div className={styles.info}>
                    <p>{en ? "Code" : "კოდი"}: {item.id}</p>
                    <h5>{item.title}</h5>

                    {item.isSystem && (
                      <div className={styles.configuredParts}>
                        <strong>{en ? "Configured parts" : "შეცვლილი კონფიგურაცია"}</strong>
                        <ul>{item.systemProducts?.map((part) => <li key={part.id}>{part.title} × {part.quantity}</li>)}</ul>
                        <button type="button" onClick={() => router.push(`/prebuilt/${item.id}`)}>{en ? "Edit configuration" : "კონფიგურაციის რედაქტირება"}</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.center}>
                  <div className={styles.counter}>
                    <button type="button" onClick={() => decrease(item.id)}>
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increase(item.id)}
                      disabled={
                        !item.isInStock ||
                        (item.availableQuantity != null && item.quantity >= item.availableQuantity)
                      }
                      aria-label={
                        item.isInStock
                          ? (en ? "Increase quantity" : "რაოდენობის გაზრდა")
                          : (en ? "Out of stock" : "მარაგში არ არის")
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.right}>
                  <div className={styles.priceBlock}>
                    <span className={styles.price}>
                      {(item.price * item.quantity).toLocaleString()} ₾
                    </span>

                    {item.oldPrice && (
                      <span className={styles.oldPrice}>
                        {(item.oldPrice * item.quantity).toLocaleString()} ₾
                      </span>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.replaceItemBtn}
                      disabled={openingReplacementId === item.id}
                      onClick={() => void startCartItemReplacement(item)}
                      aria-label={en ? `Replace ${item.title}` : `${item.title} — ამოცვლა`}
                      title={en ? "Replace" : "ამოცვლა"}
                    >
                      <PencilSquare aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => {
                        void removeFromCart(item.id);
                        resolveStockIssue(item.id);
                      }}
                      aria-label={en ? `Remove ${item.title}` : `${item.title} — წაშლა`}
                      title={en ? "Remove" : "წაშლა"}
                    >
                      <Trash3 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              {stockIssue && (
                <div className={styles.stockIssuePanel} role="alert">
                  <strong>{stockIssue.parts.length > 0 ? (en ? "A component is short in stock:" : "ამ ნაწილის მარაგი არ კმარა:") : (en ? "The requested quantity is unavailable" : "მოთხოვნილი რაოდენობა მარაგში არ არის")}</strong>
                  {stockIssue.parts.length > 0 ? stockIssue.parts.map((part) => (
                    <div className={styles.stockIssuePart} key={part.productId}>
                      <div>
                        <span>{part.name}</span>
                        {part.sku && <small>SKU: {part.sku}</small>}
                        <small>{en ? `In stock: ${part.available}, needed: ${part.needed}` : `მარაგშია ${part.available}, საჭიროა ${part.needed}`}</small>
                      </div>
                      <button type="button" disabled={resolvingPartId === part.productId} onClick={() => void startPartReplacement(item.id, part.productId)}>
                        {resolvingPartId === part.productId ? "…" : en ? "Replace" : "შეცვლა"}
                      </button>
                    </div>
                  )) : (
                    <div className={styles.stockIssuePart}>
                      <span>{en ? `In stock: ${stockIssue.available}, requested: ${stockIssue.requested}` : `მარაგშია ${stockIssue.available}, მოთხოვნილია ${stockIssue.requested}`}</span>
                      <button type="button" onClick={() => void fixOrdinaryStock(item.id, stockIssue.available)}>
                        {stockIssue.available > 0 ? (en ? "Lower quantity" : "რაოდენობის შემცირება") : (en ? "Remove" : "წაშლა")}
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
            );})}
          </div>

          {stockIssueError && <p className={styles.stockIssueError} role="alert">{stockIssueError}</p>}
          {replacementError && <p className={styles.stockIssueError} role="alert">{replacementError}</p>}

          {showSummary && (
            <div className={styles.summary}>
              <div className={styles.total}>
                {en ? "Total amount" : "ჯამური თანხა"}: <strong>{total.toLocaleString()} ₾</strong>
              </div>

              <button
                className={`${styles.orderBtn} ${
                  isContinuing ? styles.loading : ""
                }`}
                onClick={handleContinue}
                disabled={isContinuing || hasUnavailableItems}
              >
                {isContinuing && <span className={styles.spinner} />}
                <span>
                  {hasUnavailableItems
                    ? (en ? "Some items are out of stock" : "ზოგი პროდუქტი მარაგში არ არის")
                    : (en ? "Proceed to checkout" : "შეკვეთის გაფორმება")}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
