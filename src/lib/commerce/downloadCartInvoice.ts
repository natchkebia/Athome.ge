import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import type { ProfileCartItem } from "@/lib/api/profileCommerce";
import type { CartQuote } from "@/lib/api/cartQuote";
import { normalizeMediaUrl } from "@/lib/storefront/products";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
// Keep invoice accents aligned with the branded configurator PDF.
const BRAND = rgb(249 / 255, 4 / 255, 70 / 255);
const INK = rgb(59 / 255, 63 / 255, 66 / 255);
const MUTED = rgb(105 / 255, 108 / 255, 110 / 255);
const SOFT = rgb(251 / 255, 243 / 255, 245 / 255);
const LINE = rgb(233 / 255, 235 / 255, 248 / 255);
const WHITE = rgb(1, 1, 1);

function money(value: number, locale: "ka" | "en") {
  return `${new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ₾`;
}

function drawRight(page: PDFPage, text: string, right: number, y: number, font: PDFFont, size: number, color = INK) {
  page.drawText(text, { x: right - font.widthOfTextAtSize(text, size), y, font, size, color });
}

function wrapText(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    // Long model numbers may have no spaces. Split them so the price columns stay clear.
    for (const character of word) {
      if (font.widthOfTextAtSize(line + character, size) > width && line) {
        lines.push(line);
        line = "";
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function downloadPdf(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const url = URL.createObjectURL(new Blob([copy.buffer], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function loadProductThumbnail(imageUrl?: string) {
  if (!imageUrl) return null;
  try {
    const normalized = normalizeMediaUrl(imageUrl);
    const parsed = new URL(normalized, window.location.origin);
    const imageSource = parsed.hostname === "api.ithome.ge" && parsed.pathname.startsWith("/uploads/products/images/")
      ? `/api/storefront/invoice-image?path=${encodeURIComponent(parsed.pathname)}`
      : normalized;
    const response = await fetch(imageSource, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const scale = Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    context.drawImage(bitmap, (120 - width) / 2, (120 - height) / 2, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch {
    // Some supplier images do not allow cross-origin reads; keep the row readable.
    return null;
  }
}

export async function downloadCartInvoice(items: ProfileCartItem[], locale: "ka" | "en", quote: CartQuote | null = null) {
  if (items.length === 0) return;

  const en = locale === "en";
  const now = new Date();
  const date = new Intl.DateTimeFormat(en ? "en-GB" : "ka-GE", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(now);
  const filenameDate = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
  const pricedItems = items.map((item) => {
    const quoted = quote?.lines.find((line) => line.productId === item.productId);
    return { ...item, displayPrice: quoted?.unitPrice ?? item.unitPrice ?? item.sellingPrice };
  });
  const productTotal = pricedItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);
  const originalTotal = quote?.listSubtotal ?? items.reduce((sum, item) => sum + (item.compareAtPrice ?? item.oldPrice ?? item.unitPrice ?? item.sellingPrice) * item.quantity, 0);
  const saleDiscount = quote?.saleDiscount ?? Math.max(0, originalTotal - productTotal);
  const couponDiscount = quote?.couponDiscount ?? 0;
  const otherDiscount = Math.max(0, (quote?.orderDiscount ?? 0) - couponDiscount);
  const total = quote?.total ?? productTotal;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const [fontResponse, logoResponse] = await Promise.all([
    fetch("/fonts-noto-sans-georgian.ttf"),
    fetch("/icons/Logo.png"),
  ]);
  if (!fontResponse.ok || !logoResponse.ok) throw new Error(en ? "Invoice assets are unavailable." : "ინვოისის რესურსები მიუწვდომელია.");

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await fontResponse.arrayBuffer(), { subset: true });
  const logo = await pdf.embedPng(await logoResponse.arrayBuffer());
  const thumbnails = await Promise.all(pricedItems.map(async (item) => {
    const bytes = await loadProductThumbnail(item.imageUrl);
    return bytes ? pdf.embedPng(bytes) : null;
  }));
  pdf.setTitle(en ? "Athome.ge preliminary invoice" : "Athome.ge წინასწარი ინვოისი");
  pdf.setAuthor("Athome.ge");
  pdf.setCreator("Athome.ge Storefront");

  const pages: PDFPage[] = [];
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = PAGE_HEIGHT - MARGIN;

  const heading = () => {
    const logoWidth = 132;
    const logoHeight = logoWidth * logo.height / logo.width;
    page.drawImage(logo, { x: MARGIN, y: y - logoHeight + 8, width: logoWidth, height: logoHeight });
    drawRight(page, en ? "Cart quotation" : "კალათის შეთავაზება", PAGE_WIDTH - MARGIN, y - 5, font, 10, BRAND);
    drawRight(page, "info@athome.ge  |  athome.ge", PAGE_WIDTH - MARGIN, y - 21, font, 8, MUTED);
    y -= 58;
    page.drawRectangle({ x: MARGIN, y, width: PAGE_WIDTH - MARGIN * 2, height: 3, color: BRAND });
    y -= 39;
    page.drawText(en ? "Preliminary invoice" : "წინასწარი ინვოისი", { x: MARGIN, y, font, size: 20, color: INK });
    y -= 34;
    page.drawRectangle({ x: MARGIN, y: y - 48, width: PAGE_WIDTH - MARGIN * 2, height: 62, color: SOFT });
    const columns = [MARGIN + 14, MARGIN + 145, MARGIN + 275, MARGIN + 403];
    const metadata = en
      ? [["Order number", "Pending"], ["Customer", "At checkout"], ["Date", date], ["Collection", "At checkout"]]
      : [["შეკვეთის ნომერი", "ჯერ არ არის"], ["მყიდველი", "გაფორმებისას"], ["თარიღი", date], ["მიღების მეთოდი", "გაფორმებისას"]];
    metadata.forEach(([label, value], index) => {
      page.drawText(label, { x: columns[index], y, font, size: 7.5, color: MUTED });
      page.drawText(value, { x: columns[index], y: y - 19, font, size: 8.5, color: INK });
    });
    y -= 82;
  };

  const tableHeading = () => {
    const width = PAGE_WIDTH - MARGIN * 2;
    page.drawRectangle({ x: MARGIN, y: y - 27, width, height: 27, color: BRAND });
    page.drawText(en ? "Product" : "პროდუქცია", { x: MARGIN + 12, y: y - 18, font, size: 9, color: WHITE });
    drawRight(page, en ? "Price" : "ფასი", PAGE_WIDTH - MARGIN - 12, y - 18, font, 9, WHITE);
    y -= 27;
  };

  heading();
  tableHeading();

  for (const [index, item] of pricedItems.entries()) {
    const name = item.productName || item.productSku || String(item.productId);
    const nameLines = wrapText(name, font, 9, 325);
    const rowHeight = Math.max(62, 29 + nameLines.length * 12);
    if (y - rowHeight < 185) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(page);
      y = PAGE_HEIGHT - MARGIN;
      page.drawText(en ? "Preliminary invoice" : "წინასწარი ინვოისი", { x: MARGIN, y, font, size: 14, color: INK });
      drawRight(page, date, PAGE_WIDTH - MARGIN, y, font, 8, MUTED);
      y -= 30;
      tableHeading();
    }
    if (index % 2 === 1) page.drawRectangle({ x: MARGIN, y: y - rowHeight, width: PAGE_WIDTH - MARGIN * 2, height: rowHeight, color: SOFT });
    page.drawLine({ start: { x: MARGIN, y: y - rowHeight }, end: { x: PAGE_WIDTH - MARGIN, y: y - rowHeight }, thickness: 0.8, color: LINE });
    page.drawRectangle({ x: MARGIN + 10, y: y - rowHeight / 2 - 22, width: 44, height: 44, color: WHITE });
    if (thumbnails[index]) page.drawImage(thumbnails[index], { x: MARGIN + 12, y: y - rowHeight / 2 - 20, width: 40, height: 40 });
    nameLines.forEach((line, lineIndex) => page.drawText(line, { x: MARGIN + 68, y: y - 18 - lineIndex * 12, font, size: 9, color: INK }));
    page.drawText(`${en ? "Quantity" : "რაოდენობა"}: ${item.quantity}`, { x: MARGIN + 68, y: y - 20 - nameLines.length * 12, font, size: 8, color: MUTED });
    drawRight(page, money(item.displayPrice * item.quantity, locale), PAGE_WIDTH - MARGIN - 12, y - rowHeight / 2 - 3, font, 9);
    y -= rowHeight;
  }

  const notice = en
    ? `This is a preliminary cart invoice, not a completed order or proof of payment. ${quote?.shippingQuoted ? "Delivery is based on the current selection." : "Delivery is calculated at checkout."} Prices and stock may change.`
    : `ეს არის კალათის წინასწარი ინვოისი და არა გაფორმებული შეკვეთა ან გადახდის დამადასტურებელი დოკუმენტი. ${quote?.shippingQuoted ? "მიწოდება ეფუძნება მიმდინარე არჩევანს." : "მიწოდება გამოითვლება გაფორმებისას."} ფასები და მარაგი შესაძლოა შეიცვალოს.`;
  const noticeLines = wrapText(notice, font, 8, PAGE_WIDTH - MARGIN * 2 - 28);
  const noticeHeight = 24 + noticeLines.length * 12;
  const summaryRows = 3 + Number(saleDiscount > 0) + Number(couponDiscount > 0) + Number(otherDiscount > 0) + Number(Boolean(quote?.shippingQuoted));
  const requiredHeight = 26 + (summaryRows - 1) * 24 + 28 + 16 + noticeHeight + 55;
  if (y < requiredHeight) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
    page.drawText(en ? "Order summary" : "კალათის შეჯამება", { x: MARGIN, y, font, size: 14, color: INK });
    y -= 35;
  }
  y -= 26;
  const summaryX = MARGIN;
  const summaryRight = PAGE_WIDTH - MARGIN - 12;
  const summaryRow = (label: string, value: string, highlight = false) => {
    page.drawText(label, { x: summaryX + 12, y, font, size: highlight ? 11 : 9, color: highlight ? BRAND : MUTED });
    drawRight(page, value, summaryRight, y, font, highlight ? 11 : 9, highlight ? BRAND : INK);
    y -= highlight ? 28 : 24;
  };
  page.drawRectangle({ x: summaryX, y: y + 13, width: PAGE_WIDTH - MARGIN - summaryX, height: 2, color: BRAND });
  summaryRow(en ? "Total quantity" : "რაოდენობა", `${count}`);
  summaryRow(en ? "Products" : "პროდუქტები", money(originalTotal, locale));
  if (saleDiscount > 0) summaryRow(en ? "Sale discount" : "ფასდაკლება", `−${money(saleDiscount, locale)}`);
  if (couponDiscount > 0) summaryRow(en ? "Coupon discount" : "პრომოკოდის ფასდაკლება", `−${money(couponDiscount, locale)}`);
  if (otherDiscount > 0) summaryRow(en ? "Other discount" : "სხვა ფასდაკლება", `−${money(otherDiscount, locale)}`);
  if (quote?.shippingQuoted) summaryRow(en ? "Delivery" : "მიწოდება", money(quote.shipping, locale));
  summaryRow(en ? "Total" : "ჯამი", money(total, locale), true);

  if (y - 16 - noticeHeight < 55) {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
  }
  y -= 16;
  page.drawRectangle({ x: MARGIN, y: y - noticeHeight, width: PAGE_WIDTH - MARGIN * 2, height: noticeHeight, color: SOFT });
  page.drawRectangle({ x: MARGIN, y: y - noticeHeight, width: 3, height: noticeHeight, color: BRAND });
  noticeLines.forEach((line, index) => page.drawText(line, { x: MARGIN + 14, y: y - 20 - index * 12, font, size: 8, color: MUTED }));

  pages.forEach((current, index) => {
    current.drawLine({ start: { x: MARGIN, y: 32 }, end: { x: PAGE_WIDTH - MARGIN, y: 32 }, thickness: 0.7, color: LINE });
    current.drawText("Athome.ge", { x: MARGIN, y: 18, font, size: 8, color: MUTED });
    drawRight(current, `${index + 1} / ${pages.length}`, PAGE_WIDTH - MARGIN, 18, font, 8, MUTED);
  });

  downloadPdf(await pdf.save(), `athome-invoice-${filenameDate}.pdf`);
}
