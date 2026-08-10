"use client";

import Link from "next/link";
import styles from "./Step5Complete.module.scss";
import type { FormValues } from "./Step1Contact";
import { useCommerce } from "@/contexts/CommerceContext";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import type { CheckoutResponse } from "@/lib/api/checkout";
import type { ProfileCartItem } from "@/lib/api/profileCommerce";

type Step5CompleteProps = {
  contactData?: FormValues | null;
  orderType?: "store" | "delivery" | null;
  result?: CheckoutResponse | null;
  items?: ProfileCartItem[];
};

function formatPrice(value: number) {
  return `${value.toLocaleString()} ₾`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function Step5Complete({
  contactData,
  orderType,
  result,
  items: itemsProp,
}: Step5CompleteProps) {
  const { cart } = useCommerce();
  const createdAt = new Date();
  const orderNumber =
    result?.orderNumber ||
    `ATH-${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(createdAt.getDate()).padStart(2, "0")}-${String(
      createdAt.getTime()
    ).slice(-6)}`;

  const sourceItems = itemsProp ?? cart.items;
  const items = sourceItems.filter((item) => item.productName);
  const bankTransfer = result?.bankTransferDetails;
  const subtotal = items.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  );
  // ფასდაკლების გარეშე პროდუქტს oldPrice არ აქვს — მისი „ძველი ფასი" = მიმდინარეს,
  // რომ შერეულ კალათაშიც დანაზოგი სწორად დაითვალოს (და არა 0-ზე ჩამოიჭრას).
  const oldTotal = items.reduce(
    (sum, item) => sum + (item.oldPrice ?? item.sellingPrice) * item.quantity,
    0
  );
  const discount = Math.max(oldTotal - subtotal, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = result?.totalAmount ?? subtotal;
  // დასრულების ეკრანზე მხოლოდ checkout-ის საბოლოო თანხას ვენდობით;
  // quote წინასწარი შეფასებაა და payload-ში არ იგზავნება.
  const deliveryFee = orderType === "delivery"
    ? result?.shippingAmount ?? Math.max(total - subtotal, 0)
    : 0;

  const customerName =
    contactData?.type === "company"
      ? contactData.companyName
      : [contactData?.firstName, contactData?.lastName]
          .filter(Boolean)
          .join(" ");

  const customerLabel = customerName || "მომხმარებელი";
  const deliveryLabel =
    orderType === "store" ? "ფილიალიდან გატანა" : "კურიერით მიწოდება";

  const printInvoice = () => {
    const rows = items
      .map((item) => {
        const image = normalizeMediaUrl(item.imageUrl);
        return `
          <tr>
            <td>
              <div class="product">
                ${
                  image
                    ? `<img src="${escapeHtml(image)}" alt="" />`
                    : `<span class="image-placeholder"></span>`
                }
                <div>
                  <strong>${escapeHtml(item.productName)}</strong>
                  <span>რაოდენობა: ${item.quantity}</span>
                </div>
              </div>
            </td>
            <td>${formatPrice(item.sellingPrice * item.quantity)}</td>
          </tr>
        `;
      })
      .join("");

    const popup = window.open("", "_blank", "width=960,height=720");

    if (!popup) {
      window.print();
      return;
    }

    popup.document.write(`
      <!doctype html>
      <html lang="ka">
        <head>
          <meta charset="utf-8" />
          <title>ინვოისი ${escapeHtml(orderNumber)}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 32px; color: #3b3f42; font-family: Arial, sans-serif; }
            .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
            .brand { font-size: 24px; font-weight: 800; }
            .status { color: #59b65a; font-weight: 700; }
            .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; background: #eef5f8; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
            .meta span, .summary span { display: block; color: #7a858c; font-size: 12px; margin-bottom: 6px; }
            .meta strong, .summary strong { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #ecf2f6; border-radius: 14px; overflow: hidden; }
            th, td { padding: 18px; border-bottom: 1px solid #ecf2f6; text-align: left; vertical-align: middle; }
            th:last-child, td:last-child { text-align: right; }
            .product { display: flex; align-items: center; gap: 14px; }
            .product img, .image-placeholder { width: 52px; height: 52px; object-fit: contain; background: #f6f8fb; border-radius: 8px; display: inline-block; }
            .product span { display: block; margin-top: 6px; color: #7a858c; font-size: 12px; }
            .summary { margin-top: 24px; margin-left: auto; width: 320px; display: grid; gap: 12px; }
            .summary-row { display: flex; justify-content: space-between; border-bottom: 1px solid #ecf2f6; padding-bottom: 10px; }
            .total { font-size: 18px; font-weight: 800; }
          </style>
        </head>
        <body>
          <div class="top">
            <div class="brand">at home</div>
            <div class="status">შეკვეთა მიღებულია</div>
          </div>
          <div class="meta">
            <div><span>შეკვეთის ნომერი</span><strong>${escapeHtml(
              orderNumber
            )}</strong></div>
            <div><span>მყიდველი</span><strong>${escapeHtml(
              customerLabel
            )}</strong></div>
            <div><span>თარიღი</span><strong>${escapeHtml(
              formatDate(createdAt)
            )}</strong></div>
            <div><span>მიღების მეთოდი</span><strong>${escapeHtml(
              deliveryLabel
            )}</strong></div>
          </div>
          <table>
            <thead><tr><th>პროდუქცია</th><th>ფასი</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="summary">
            <div class="summary-row"><span>რაოდენობა</span><strong>${totalQuantity} ცალი</strong></div>
            <div class="summary-row"><span>ღირებულება</span><strong>${formatPrice(
              subtotal
            )}</strong></div>
            ${
              discount > 0
                ? `<div class="summary-row"><span>დანაზოგი</span><strong>${formatPrice(
                    discount
                  )}</strong></div>`
                : ""
            }
            ${
              deliveryFee > 0
                ? `<div class="summary-row"><span>მიწოდება</span><strong>${formatPrice(
                    deliveryFee
                  )}</strong></div>`
                : ""
            }
            <div class="summary-row total"><span>ჯამი</span><strong>${formatPrice(
              total
            )}</strong></div>
          </div>
          <script>
            window.addEventListener("load", () => {
              window.print();
            });
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <section className={styles.complete}>
      <div className={styles.hero}>
        <div className={styles.checkmark}>✓</div>
        <h2>შეკვეთა მიღებულია</h2>
        <Link href="/" className={styles.homeLink}>
          მთავარი გვერდი
        </Link>
      </div>

      {bankTransfer && (
        <div
          style={{
            background: "#eef5f8",
            borderRadius: 12,
            padding: 20,
            margin: "0 auto 24px",
            maxWidth: 520,
          }}
        >
          <h3 style={{ marginTop: 0 }}>გადარიცხვის დეტალები</h3>
          <p>გთხოვთ, თანხა გადარიცხოთ შემდეგ ანგარიშზე:</p>
          {bankTransfer.accountName && (
            <p>
              <strong>მიმღები:</strong> {bankTransfer.accountName}
            </p>
          )}
          {bankTransfer.iban && (
            <p>
              <strong>IBAN:</strong> {bankTransfer.iban}
            </p>
          )}
          <p>
            <strong>დანიშნულება:</strong> {orderNumber}
          </p>
          {bankTransfer.instructions && <p>{bankTransfer.instructions}</p>}
        </div>
      )}

      <div className={styles.invoiceCard}>
        <div className={styles.invoiceMeta}>
          <div>
            <span>შეკვეთის ნომერი</span>
            <strong>{orderNumber}</strong>
          </div>
          <div>
            <span>მყიდველი</span>
            <strong>{customerLabel}</strong>
          </div>
          <div>
            <span>თარიღი</span>
            <strong>{formatDate(createdAt)}</strong>
          </div>
          <div>
            <span>ჯამური თანხა</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button type="button" onClick={printInvoice}>
            ინვოისის ამობეჭდვა
          </button>
        </div>

        <div className={styles.orderDetails}>
          <h3>შეკვეთის დეტალები</h3>

          <div className={styles.tableHeader}>
            <span>პროდუქცია</span>
            <span>ფასი</span>
          </div>

          <div className={styles.productList}>
            {items.map((item) => (
              <div className={styles.productRow} key={item.productId}>
                <div className={styles.productInfo}>
                  <img
                    src={normalizeMediaUrl(item.imageUrl) || "/icons/product1.svg"}
                    alt={item.productName}
                  />
                  <div>
                    <strong>{item.productName}</strong>
                    <span>რაოდენობა: {item.quantity}</span>
                  </div>
                </div>
                <div className={styles.productPrice}>
                  <strong>{formatPrice(item.sellingPrice * item.quantity)}</strong>
                  {item.oldPrice && (
                    <span>{formatPrice(item.oldPrice * item.quantity)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div>
              <span>რაოდენობა</span>
              <strong>{totalQuantity} ცალი</strong>
            </div>
            <div>
              <span>ღირებულება</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {discount > 0 && (
              <div>
                <span>დანაზოგი</span>
                <strong>{formatPrice(discount)}</strong>
              </div>
            )}
            {deliveryFee > 0 && (
              <div>
                <span>მიწოდება</span>
                <strong>{formatPrice(deliveryFee)}</strong>
              </div>
            )}
            <div className={styles.grandTotal}>
              <span>ჯამი</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
