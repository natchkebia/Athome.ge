import type {
  ConfiguratorCategoryKey,
  SelectedConfiguratorProduct,
} from "@/components/configurator/configuratorTypes";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

const CATEGORY_NAMES: Record<ConfiguratorCategoryKey, { ka: string; en: string }> = {
  processor: { ka: "პროცესორი", en: "Processor" },
  motherboard: { ka: "დედაპლატა", en: "Motherboard" },
  ram: { ka: "ოპერატიული მეხსიერება", en: "Memory" },
  gpu: { ka: "ვიდეობარათი", en: "Graphics card" },
  psu: { ka: "კვების ბლოკი", en: "Power supply" },
  cooler: { ka: "პროცესორის გაგრილება", en: "CPU cooler" },
  case: { ka: "ქეისი", en: "Case" },
  drive: { ka: "მყარი დისკი", en: "Hard drive" },
  storage: { ka: "SSD მეხსიერება", en: "SSD storage" },
  caseFan: { ka: "ქეისის ქულერი", en: "Case fan" },
  os: { ka: "სისტემის ლიცენზია", en: "System license" },
  monitor: { ka: "მონიტორი", en: "Monitor" },
  headphones: { ka: "ყურსასმენი", en: "Headset" },
  keyboard: { ka: "კლავიატურა", en: "Keyboard" },
  mouse: { ka: "მაუსი", en: "Mouse" },
  microphone: { ka: "მიკროფონი", en: "Microphone" },
  speaker: { ka: "დინამიკები", en: "Speakers" },
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const BRAND = rgb(16 / 255, 181 / 255, 192 / 255);
const INK = rgb(38 / 255, 50 / 255, 56 / 255);
const MUTED = rgb(105 / 255, 118 / 255, 126 / 255);
const LINE = rgb(220 / 255, 231 / 255, 234 / 255);
const SOFT = rgb(247 / 255, 249 / 255, 250 / 255);

function formatMoney(value: number, locale: string) {
  return `${new Intl.NumberFormat(locale === "en" ? "en-US" : "ka-GE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ₾`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRight(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size: number, color = INK) {
  page.drawText(text, { x: x - font.widthOfTextAtSize(text, size), y, font, size, color });
}

function downloadBytes(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const url = URL.createObjectURL(new Blob([copy.buffer], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function printConfiguration(
  selectedProducts: Record<string, SelectedConfiguratorProduct[] | undefined>,
  locale: "ka" | "en",
) {
  const products = Object.values(selectedProducts).flatMap((items) => items || []);
  if (products.length === 0) return false;

  const en = locale === "en";
  const language = en ? "en" : "ka";
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const generatedAt = new Intl.DateTimeFormat(en ? "en-GB" : "ka-GE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const dateCode = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const quoteNumber = `ATH-${dateCode}-${String(Date.now()).slice(-5)}`;

  const [fontBytes, logoBytes] = await Promise.all([
    fetch("/fonts-noto-sans-georgian.ttf").then((response) => {
      if (!response.ok) throw new Error("PDF font is unavailable");
      return response.arrayBuffer();
    }),
    fetch("/icons/Logo.png").then((response) => {
      if (!response.ok) throw new Error("PDF logo is unavailable");
      return response.arrayBuffer();
    }),
  ]);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const logo = await pdf.embedPng(logoBytes);
  pdf.setTitle(en ? "Athome.ge configuration quotation" : "Athome.ge კონფიგურაციის შეთავაზება");
  pdf.setAuthor("Athome.ge");
  pdf.setCreator("Athome.ge Configurator");

  const pages: PDFPage[] = [];
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = PAGE_HEIGHT - MARGIN;

  const drawDocumentHeader = () => {
    const logoWidth = 142;
    const logoHeight = logoWidth * (logo.height / logo.width);
    page.drawImage(logo, { x: MARGIN, y: y - logoHeight + 2, width: logoWidth, height: logoHeight });

    const companyLines = [
      "At Home",
      "032 2 08 09 08  |  +995 599 09 32 09",
      "info@athome.ge  |  athome.ge",
      en
        ? "Tbilisi, 115 Akaki Tsereteli Ave. / 73 Merab Kostava St."
        : "თბილისი, აკაკი წერეთლის გამზირი #115 / მერაბ კოსტავას ქუჩა #73",
    ];
    companyLines.forEach((line, index) => drawRight(page, line, PAGE_WIDTH - MARGIN, y - index * 14, font, index === 0 ? 11 : 8.5, index === 0 ? INK : MUTED));
    y -= 70;
    page.drawRectangle({ x: MARGIN, y, width: PAGE_WIDTH - MARGIN * 2, height: 2.5, color: BRAND });
    y -= 38;
    page.drawText(en ? "System configuration quotation" : "სისტემური ბლოკის კონფიგურაცია", { x: MARGIN, y, font, size: 20, color: INK });
    y -= 25;
    page.drawText(`№ ${quoteNumber}`, { x: MARGIN, y, font, size: 8.5, color: MUTED });
    drawRight(page, `${en ? "Generated" : "შექმნის თარიღი"}: ${generatedAt}`, PAGE_WIDTH - MARGIN, y, font, 8.5, MUTED);
    y -= 28;
  };

  const drawTableHeader = () => {
    const width = PAGE_WIDTH - MARGIN * 2;
    page.drawRectangle({ x: MARGIN, y: y - 24, width, height: 24, color: BRAND });
    page.drawText(en ? "Component / product" : "კომპონენტი / პროდუქტი", { x: MARGIN + 9, y: y - 16, font, size: 8.5, color: rgb(1, 1, 1) });
    page.drawText(en ? "Qty" : "რაოდ.", { x: 340, y: y - 16, font, size: 8.5, color: rgb(1, 1, 1) });
    drawRight(page, en ? "Unit price" : "ერთ. ფასი", 458, y - 16, font, 8.5, rgb(1, 1, 1));
    drawRight(page, en ? "Total" : "ჯამი", PAGE_WIDTH - MARGIN - 8, y - 16, font, 8.5, rgb(1, 1, 1));
    y -= 24;
  };

  const newTablePage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
    page.drawText(en ? "System configuration quotation" : "სისტემური ბლოკის კონფიგურაცია", { x: MARGIN, y, font, size: 14, color: INK });
    drawRight(page, `№ ${quoteNumber}`, PAGE_WIDTH - MARGIN, y, font, 8.5, MUTED);
    y -= 28;
    drawTableHeader();
  };

  drawDocumentHeader();
  drawTableHeader();

  products.forEach((item, index) => {
    const category = CATEGORY_NAMES[item.category]?.[language] || item.category;
    const titleLines = wrapText(item.title, font, 8.5, 225).slice(0, 3);
    const rowHeight = Math.max(48, 25 + titleLines.length * 11);
    if (y - rowHeight < 145) newTablePage();

    if (index % 2 === 1) page.drawRectangle({ x: MARGIN, y: y - rowHeight, width: PAGE_WIDTH - MARGIN * 2, height: rowHeight, color: SOFT });
    page.drawRectangle({ x: MARGIN, y: y - rowHeight, width: PAGE_WIDTH - MARGIN * 2, height: rowHeight, borderColor: LINE, borderWidth: 0.7 });
    page.drawText(category, { x: MARGIN + 9, y: y - 16, font, size: 8.5, color: INK });
    titleLines.forEach((line, lineIndex) => page.drawText(line, { x: MARGIN + 9, y: y - 29 - lineIndex * 10, font, size: 8.5, color: MUTED }));
    page.drawText(String(item.quantity), { x: 350, y: y - rowHeight / 2 - 3, font, size: 9, color: INK });
    drawRight(page, formatMoney(item.price, locale), 458, y - rowHeight / 2 - 3, font, 8.5);
    drawRight(page, formatMoney(item.price * item.quantity, locale), PAGE_WIDTH - MARGIN - 8, y - rowHeight / 2 - 3, font, 8.5, INK);
    y -= rowHeight;
  });

  if (y < 205) newTablePage();
  y -= 18;
  const summaryX = 305;
  page.drawRectangle({ x: summaryX, y: y - 2, width: PAGE_WIDTH - MARGIN - summaryX, height: 2, color: BRAND });
  y -= 23;
  page.drawText(en ? "Total quantity" : "სულ რაოდენობა", { x: summaryX + 4, y, font, size: 9, color: MUTED });
  drawRight(page, String(totalQuantity), PAGE_WIDTH - MARGIN, y, font, 9);
  y -= 28;
  page.drawText(en ? "Configuration total" : "კონფიგურაციის ჯამი", { x: summaryX + 4, y, font, size: 12, color: BRAND });
  drawRight(page, formatMoney(totalPrice, locale), PAGE_WIDTH - MARGIN, y, font, 12, BRAND);
  y -= 48;

  const notice = en
    ? "Prices and stock are current at the time the document is generated and may change. Please confirm availability before purchase."
    : "ფასები და მარაგი აქტუალურია დოკუმენტის შექმნის მომენტში და შესაძლოა შეიცვალოს. შეძენამდე გთხოვთ გადაამოწმოთ ხელმისაწვდომობა.";
  const noticeLines = wrapText(notice, font, 8.5, PAGE_WIDTH - MARGIN * 2 - 24);
  const noticeHeight = 22 + noticeLines.length * 12;
  page.drawRectangle({ x: MARGIN, y: y - noticeHeight + 8, width: PAGE_WIDTH - MARGIN * 2, height: noticeHeight, color: rgb(239 / 255, 250 / 255, 251 / 255) });
  page.drawRectangle({ x: MARGIN, y: y - noticeHeight + 8, width: 3, height: noticeHeight, color: BRAND });
  noticeLines.forEach((line, index) => page.drawText(line, { x: MARGIN + 13, y: y - 9 - index * 12, font, size: 8.5, color: MUTED }));

  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({ start: { x: MARGIN, y: 31 }, end: { x: PAGE_WIDTH - MARGIN, y: 31 }, thickness: 0.7, color: LINE });
    pdfPage.drawText("Athome.ge", { x: MARGIN, y: 17, font, size: 7.5, color: MUTED });
    drawRight(pdfPage, `${index + 1} / ${pages.length}`, PAGE_WIDTH - MARGIN, 17, font, 7.5, MUTED);
  });

  const pdfBytes = await pdf.save();
  downloadBytes(pdfBytes, `athome-configuration-${dateCode}.pdf`);
  return true;
}
