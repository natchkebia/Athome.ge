"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import styles from "./ProductDetail.module.scss";
import ProductGallery from "./ProductGallery";
// დროებით გამორთულია დამკვეთის მოთხოვნით.
// დასაბრუნებლად გააქტიურდეს import და ქვემოთ არსებული ProductReviews ბლოკი.
// import ProductReviews from "./ProductReviews";
import StockCheck from "./StockCheck";
import ProductSection from "../shared/ProductSection";
import {
  getStorefrontProductsByCategory,
  StorefrontProductDetail,
} from "@/lib/api/storefront";
import {
  mapStorefrontProductToCard,
  normalizeMediaUrl,
  StorefrontProductCard,
} from "@/lib/storefront/products";
import { useCommerce } from "@/contexts/CommerceContext";
import { useCompare } from "@/contexts/CompareContext";
import { useToast } from "@/contexts/ToastContext";
import { cacheProductInfo } from "@/lib/commerce/guestStore";
import { flyToTarget } from "@/lib/ui/flyToCart";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import PrebuiltConfigurator from "./PrebuiltConfigurator";

interface Spec {
  label: string;
  value: string;
}

interface SpecGroup {
  name: string;
  fields: Spec[];
}

function isModelSpec(label: string) {
  const normalizedLabel = label.trim().replace(/:$/, "").toLocaleLowerCase();
  return normalizedLabel === "model" || normalizedLabel === "მოდელი";
}

// componentType (backend enum) → ქართული სათაური. ენუმი შეიძლება გაიზარდოს —
// უცნობ ტიპს ვტოვებთ (არ ვხატავთ), ვიდრე მცდარ სათაურს ვაჩვენებდეთ.
const COMPONENT_TYPE_HEADINGS: Record<string, string> = {
  Cpu: "პროცესორები",
  Motherboard: "დედა დაფები",
  Ram: "ოპერატიული მეხსიერება",
  Gpu: "ვიდეობარათები",
  Psu: "კვების ბლოკები",
  Case: "ქეისები",
  CpuAirCooler: "ჰაერის ქულერები",
  LiquidCooler: "თხევადი გაგრილება (AIO)",
};
const COMPONENT_TYPE_HEADINGS_EN: Record<string, string> = {
  Cpu: "Processors", Motherboard: "Motherboards", Ram: "Memory", Gpu: "Graphics cards",
  Psu: "Power supplies", Case: "Cases", CpuAirCooler: "Air coolers", LiquidCooler: "Liquid cooling (AIO)",
};

function sanitizeRichText(html: string) {
  let sanitized = DOMPurify.sanitize(html)
    // Rich-text editor-ის ცარიელი აბზაცები ვიზუალურ დიდ დაშორებებს ქმნის.
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/(?:<br\s*\/?>)?(?:\s|&nbsp;)+(?=<\/p>)/gi, "");

  // თუ რედაქტორში პროდუქტის წყაროს URL ცალკე აბზაცადაა ჩასმული,
  // URL-ის ნაცვლად აღწერის თავში პირველი გამუქებული სათაური გავხადოთ ბმული.
  const standaloneUrl = sanitized.match(
    /<p>\s*(https?:\/\/[^\s<]+)\s*<\/p>/i,
  );

  if (standaloneUrl && !/<(?:strong|b)>\s*<a\b/i.test(sanitized)) {
    let linkedHeading = false;
    sanitized = sanitized.replace(
      /<(strong|b)>([\s\S]*?)<\/\1>/i,
      (_match, tag, content) => {
        linkedHeading = true;
        return `<${tag}><a href="${standaloneUrl[1]}">${content}</a></${tag}>`;
      },
    );

    if (linkedHeading) {
      sanitized = sanitized.replace(standaloneUrl[0], "");
    }
  }

  // მხოლოდ ტექსტურ კვანძებში არსებული bare URL-ები გადავაქციოთ ბმულებად;
  // უკვე არსებულ HTML ატრიბუტებსა და <a>-ებს არ ვეხებით.
  let insideAnchor = false;
  const linkedHtml = sanitized
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<a\b/i.test(part)) insideAnchor = true;
        if (/^<\/a\b/i.test(part)) insideAnchor = false;
        return part;
      }

      if (insideAnchor) return part;

      return part.replace(
        /https?:\/\/[^\s<]+/gi,
        (url) =>
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
      );
    })
    .join("");

  // აღწერაში რედაქტორიდან უკვე მოსული ბმულებიც ახალ ჩანართში გავხსნათ.
  // ატრიბუტებს sanitize-ის შემდეგ ვამატებთ, რადგან DOMPurify `target`-ს შლის.
  return linkedHtml.replace(/<a\b([^>]*)>/gi, (_match, rawAttributes) => {
    const attributes = String(rawAttributes)
      .replace(/\s+target\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s+rel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    return `<a${attributes} target="_blank" rel="noopener noreferrer">`;
  });
}

export interface ProductDetailProps {
  product: StorefrontProductDetail;
  routeCategory?: string;
  routeSlug?: string;
}

type ProductInfoTab = "additional" | "details" | "reviews";

export default function ProductDetail({
  product,
  routeCategory,
  routeSlug,
}: ProductDetailProps) {
  const en = useStorefrontLocale() === "en";
  const [activeInfoTab, setActiveInfoTab] =
    useState<ProductInfoTab>("additional");
  const [showFullShortDescription, setShowFullShortDescription] = useState(false);
  const [configuredPrice, setConfiguredPrice] = useState<number | null>(null);
  const [isShortDescriptionOverflowing, setIsShortDescriptionOverflowing] =
    useState(false);
  const shortDescriptionRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCommerce();
  const { toggleCompare, compareIds, maxItems } = useCompare();
  const { showToast } = useToast();
  const router = useRouter();
  const isCompared = compareIds.has(product.id);
  const isAvailable = product.isAvailable && product.stockStatus !== "OutOfStock";
  const [fallbackRelatedProducts, setFallbackRelatedProducts] = useState<
    StorefrontProductCard[]
  >([]);
  const productImages = product.images ?? [];
  const images =
    productImages.length > 0
      ? [...productImages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => normalizeMediaUrl(image.url))
      : ["/images/discountPc.png"];
  // Backend აბრუნებს ჯგუფებსა და ველებს ჩვენების რიგით — არ ვახარისხებთ.
  const specGroups: SpecGroup[] = (product.specifications ?? [])
    .map((group) => ({
          name: group.name,
          fields: (group.fields ?? []).map((field) => ({
            label: `${field.label}:`,
            value: field.value || "-",
          })),
        }))
    .filter((group) => Boolean(group.name) && group.fields.length > 0);
  const specifications = specGroups.flatMap((group) => group.fields);

  const keyFeatures = product.keyFeatures ?? [];
  const boxContents = product.boxContents ?? [];
  const alternativeProducts = (product.alternativeProducts ?? []).map(
    mapStorefrontProductToCard
  );
  const accessoryProducts = (product.accessoryProducts ?? []).map(
    mapStorefrontProductToCard
  );
  const upsellProducts = (product.upsellProducts ?? []).map(
    mapStorefrontProductToCard
  );
  // ჯგუფებს ვხატავთ ჩამოსვლის რიგით; უცნობ componentType-ს ვტოვებთ.
  const compatibleGroups = (product.compatibleProducts ?? [])
    .map((group) => ({
      heading: (en ? COMPONENT_TYPE_HEADINGS_EN : COMPONENT_TYPE_HEADINGS)[group.componentType] ?? "",
      products: (group.products ?? []).map(mapStorefrontProductToCard),
    }))
    .filter((group) => group.heading !== "" && group.products.length > 0);
  const backendRelatedProducts = product.relatedProducts ?? [];
  const relatedProducts =
    backendRelatedProducts.length > 0
      ? backendRelatedProducts.map(mapStorefrontProductToCard)
      : fallbackRelatedProducts;
  const oldPrice =
    product.pricing.sellingPrice > product.pricing.effectivePrice
      ? product.pricing.sellingPrice
      : undefined;

  useEffect(() => {
    let isMounted = true;

    if (backendRelatedProducts.length > 0) {
      setFallbackRelatedProducts([]);
      return;
    }

    getStorefrontProductsByCategory(product.category.slug, 8)
      .then((items) => {
        if (!isMounted) return;

        setFallbackRelatedProducts(
          items
            .filter((item) => item.slug !== product.slug)
            .map(mapStorefrontProductToCard)
        );
      })
      .catch(() => {
        if (isMounted) setFallbackRelatedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [product.category.slug, backendRelatedProducts.length, product.slug]);

  useEffect(() => {
    setShowFullShortDescription(false);
    setIsShortDescriptionOverflowing(false);
    setActiveInfoTab("additional");
  }, [product.id]);

  useEffect(() => {
    const description = shortDescriptionRef.current;
    if (!description || showFullShortDescription) return;

    const measureOverflow = () => {
      setIsShortDescriptionOverflowing(
        description.scrollHeight > description.clientHeight + 1,
      );
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(description);

    return () => observer.disconnect();
  }, [product.shortDescription, showFullShortDescription]);

  // სტუმრის კალათისთვის — ჩვენების ინფოს ქეშირება.
  const cacheInfo = () =>
    cacheProductInfo({
      productId: product.id,
      productName: product.name,
      imageUrl: images[0],
      slug: product.slug,
      sellingPrice: product.pricing.effectivePrice,
      oldPrice,
      isInStock: isAvailable && product.totalEffectiveQuantity > 0,
      availableQuantity: Math.max(0, product.totalEffectiveQuantity),
    });

  // "ყიდვა" — ამატებს კალათაში და გადაჰყავს კალათის გვერდზე (სტუმარსაც).
  const handleBuyNow = async () => {
    if (!isAvailable) return;
    cacheInfo();
    await addToCart(product.id);
    router.push("/basket");
  };

  // "დამატება" — ამატებს კალათაში, სურათი კალათისკენ ფრინავს, აჩვენებს დადასტურებას.
  const handleAddToCart = async (event: React.MouseEvent) => {
    if (!isAvailable) return;
    const sourceEl = event.currentTarget as HTMLElement;
    cacheInfo();
    flyToTarget(sourceEl, images[0], "cart");
    await addToCart(product.id);
  };

  // "შედარება" — შედარების სიაში ამატებს/ხსნის.
  const handleCompare = () => {
    const result = toggleCompare({
      id: product.id,
      // URL-ის პარამეტრები ყოველთვის სწორია — backend-ის slug ხან აკლია.
      slug: product.slug || routeSlug || "",
      category: product.category?.slug || routeCategory || "",
      title: product.name,
      image: images[0],
      newPrice: product.pricing.effectivePrice,
      oldPrice,
    });

    if (result !== "added" && result !== "removed") {
      showToast(en ? `You can compare up to ${maxItems} products` : `შედარებაში მაქსიმუმ ${maxItems} პროდუქტია`, "error");
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <ProductGallery images={images} />

        <div className={styles.textContainer}>
          {product.activePromotion?.promotionName && (
            <div className={styles.promotionBadge}>
              {product.activePromotion.promotionName}
            </div>
          )}
          <div>
            <h2 className={styles.title}>{product.name}</h2>
            {product.shortDescription && (
              <div className={styles.shortDescriptionWrapper}>
                <div
                  ref={shortDescriptionRef}
                  className={`${styles.shortDescription} ${styles.richText} ${
                    !showFullShortDescription
                      ? styles.shortDescriptionCollapsed
                      : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(product.shortDescription),
                  }}
                />
                {isShortDescriptionOverflowing && (
                  <button
                    type="button"
                    className={styles.descriptionToggle}
                    aria-expanded={showFullShortDescription}
                    onClick={() =>
                      setShowFullShortDescription((current) => !current)
                    }
                  >
                    {showFullShortDescription ? (en ? "Show less" : "ნაკლების ნახვა") : (en ? "Show more" : "მეტის ნახვა")}
                  </button>
                )}
              </div>
            )}
            <div className={styles.meta}>
              <div className={styles.stockWrapper}>
                {en ? "Stock by location:" : "მარაგი ლოკაციების მიხედვით:"}{" "}
                <StockCheck stockLocations={product.stockLocations ?? []} />
              </div>
              <p>
                {en ? "Product code:" : "პროდუქტის კოდი:"} <span>{product.id}</span>
              </p>
              <p>
                {en ? "Manufacturer code:" : "მწარმოებლის კოდი:"}<span> {product.sku}</span>
              </p>
              <p>
                {en ? "Brand:" : "ბრენდი:"}{" "}
                <Link href={`/products/brand/${encodeURIComponent(product.brand.slug)}`}>
                  {product.brand.name}
                </Link>
              </p>
              {product.model && (
                <p>
                  {en ? "Model:" : "მოდელი:"}{" "}
                  {product.officialUrl ? (
                    <a
                      href={product.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {product.model} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span>{product.model}</span>
                  )}
                </p>
              )}
              <p>
                {en ? "Type:" : "ტიპი:"}{" "}
                <Link
                  href={`/products/${encodeURIComponent(
                    product.subCategory?.slug || product.category.slug
                  )}`}
                >
                  {product.subCategory?.name || product.category.name}
                </Link>
              </p>
            </div>
          </div>

          <div className={styles.priceWrapper}>
            <div className={styles.prices}>
              <div className={styles.priceContainer}>
                <span className={styles.newPrice}>
                  {(configuredPrice ?? product.pricing.effectivePrice).toFixed(2)} ₾
                </span>
                {oldPrice && (
                  <span className={styles.oldPrice}>
                    {oldPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
              <button onClick={handleBuyNow} disabled={!isAvailable || configuredPrice != null}>
                {configuredPrice != null ? (en ? "Use configured cart button" : "გამოიყენეთ კონფიგურაციის ღილაკი") : isAvailable ? (en ? "Buy now" : "ყიდვა") : (en ? "Out of stock" : "ამოწურულია")}
              </button>
            </div>

            <div className={styles.actions}>
              <button className={styles.buyBtn} onClick={handleAddToCart} disabled={!isAvailable || configuredPrice != null}>
                <img src="/icons/Cart.svg" alt="Cart.svg" />
                <span>{configuredPrice != null ? (en ? "Configured below" : "კონფიგურაცია ქვემოთაა") : isAvailable ? (en ? "Add to cart" : "დამატება") : (en ? "Out of stock" : "ამოწურულია")}</span>
              </button>
              <button
                className={`${styles.cartBtn} ${
                  isCompared ? styles.cartBtnActive : ""
                }`}
                onClick={handleCompare}
                aria-pressed={isCompared}
              >
                <img src="/icons/Arrows.svg" alt="Arrows.svg" />
                <span>{isCompared ? (en ? "In comparison" : "შედარებაშია") : (en ? "Compare" : "შედარება")}</span>
              </button>
            </div>

            <div className={styles.paymentOptions} aria-label={en ? "Installment banks" : "განვადების ბანკები"}>
              <fieldset className={styles.paymentOption}>
                <legend>{en ? "Installment" : "განვადება"}</legend>
                <img src="/icons/Tbc.svg" alt={en ? "TBC Bank" : "თიბისი ბანკი"} />
              </fieldset>
              <fieldset className={styles.paymentOption}>
                <legend>{en ? "Installment" : "განვადება"}</legend>
                <img src="/icons/Bank_of_Georgia.svg" alt={en ? "Bank of Georgia" : "საქართველოს ბანკი"} />
              </fieldset>
              <fieldset className={styles.paymentOption}>
                <legend>{en ? "Installment" : "განვადება"}</legend>
                <img src="/icons/kredo.svg" alt={en ? "Credo Bank" : "კრედო ბანკი"} />
              </fieldset>
              <fieldset className={styles.paymentOption}>
                <legend>{en ? "TBC Bank split payment" : "TBC ბანკის განაწილება"}</legend>
                <div className={styles.tbcSplitLogo}>
                  <span className={styles.tbcMark}>
                    <img src="/icons/Tbc.svg" alt="" />
                  </span>
                  <span className={styles.tbcSplitText}>
                    <span>{en ? "TBC Bank" : "თიბისი ბანკი"}</span>
                    <strong>{en ? "Split payment" : "განაწილება"}</strong>
                  </span>
                </div>
              </fieldset>
            </div>

          </div>
        </div>
      </div>

      <PrebuiltConfigurator
        productId={product.id}
        onConfiguredPrice={setConfiguredPrice}
      />

      <section className={styles.productInfoTabs}>
        <div className={styles.tabList} role="tablist" aria-label={en ? "Product information" : "პროდუქტის ინფორმაცია"}>
          {([
            ["additional", en ? "Additional information" : "დამატებითი ინფორმაცია"],
            ["details", en ? "Product details" : "პროდუქტის დეტალები"],
            ["reviews", `${en ? "Reviews" : "მიმოხილვა"} (${product.ratingCount ?? 0})`],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeInfoTab === tab}
              aria-controls={`product-info-panel-${tab}`}
              id={`product-info-tab-${tab}`}
              className={`${styles.tabButton} ${activeInfoTab === tab ? styles.activeTab : ""}`}
              onClick={() => setActiveInfoTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={styles.tabPanel}
          role="tabpanel"
          id={`product-info-panel-${activeInfoTab}`}
          aria-labelledby={`product-info-tab-${activeInfoTab}`}
        >
          {activeInfoTab === "additional" && specifications.length > 0 && (
            <div className={styles.specsSection}>
              <table>
                <tbody>
                  {specifications.map((spec, index) => (
                    <tr key={`${spec.label}-${index}`}>
                      <th>{spec.label}</th>
                      <td>
                        {product.officialUrl && isModelSpec(spec.label) ? (
                          <a
                            className={styles.officialModelLink}
                            href={product.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                          >
                            {spec.value} <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          spec.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeInfoTab === "additional" && specifications.length === 0 && (
            <p className={styles.emptyTab}>{en ? "Additional information is not available." : "დამატებითი ინფორმაცია არ არის დამატებული."}</p>
          )}

          {activeInfoTab === "details" && (
            <div className={styles.detailsPanel}>
              {product.descriptionHtml && (
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.descriptionHtml) }} />
              )}
              {(keyFeatures.length > 0 || boxContents.length > 0) && (
                <div className={styles.infoBlocks}>
                  {keyFeatures.length > 0 && <div className={styles.infoCard}><h4>{en ? "Key features" : "ძირითადი მახასიათებლები"}</h4><ul>{keyFeatures.map((item, i) => <li key={`kf-${i}`}>{item}</li>)}</ul></div>}
                  {boxContents.length > 0 && <div className={styles.infoCard}><h4>{en ? "What's in the box" : "შეფუთვის შემადგენლობა"}</h4><ul>{boxContents.map((item, i) => <li key={`bc-${i}`}>{item}</li>)}</ul></div>}
                </div>
              )}
              {!product.descriptionHtml && keyFeatures.length === 0 && boxContents.length === 0 && (
                <p className={styles.emptyTab}>{en ? "Product details are not available." : "პროდუქტის დეტალები არ არის დამატებული."}</p>
              )}
            </div>
          )}

          {activeInfoTab === "reviews" && (
            <p className={styles.emptyTab}>{en ? "There are no reviews yet." : "მიმოხილვები ჯერ არ არის."}</p>
          )}
        </div>
      </section>

      {/* დროებით გამორთულია დამკვეთის მოთხოვნით.
      <ProductReviews productId={product.id} />
      */}

      {compatibleGroups.length > 0 && (
        <div className={styles.compatWrapper}>
          <h4 className={styles.compatTitle}>{en ? "Compatible components" : "თავსებადი კომპონენტები"}</h4>
          {compatibleGroups.map((group, gi) => (
            <ProductSection
              key={`compat-${gi}`}
              icon="/icons/Monitor.svg"
              title={group.heading}
              products={group.products}
              compact
            />
          ))}
        </div>
      )}

      {alternativeProducts.length > 0 && (
        <ProductSection
          icon="/icons/Monitor.svg"
          title="ალტერნატივები"
          products={alternativeProducts}
        />
      )}

      {relatedProducts.length > 0 && (
        <ProductSection
          icon="/icons/Monitor.svg"
          title="მსგავსი პროდუქტები"
          products={relatedProducts}
        />
      )}

      {accessoryProducts.length > 0 && (
        <ProductSection
          icon="/icons/Monitor.svg"
          title="აქსესუარები"
          products={accessoryProducts}
        />
      )}

      {upsellProducts.length > 0 && (
        <ProductSection
          icon="/icons/Monitor.svg"
          title="დაამატე შეკვეთას"
          products={upsellProducts}
        />
      )}

      <div className={styles.mobilePurchaseBar}>
        <div className={styles.mobilePriceBlock}>
          <div className={styles.mobilePrices}>
            <span className={styles.mobileNewPrice}>
              {(configuredPrice ?? product.pricing.effectivePrice).toFixed(2)} ₾
            </span>
            {oldPrice && (
              <span className={styles.mobileOldPrice}>{oldPrice.toFixed(2)} ₾</span>
            )}
          </div>
          <span className={styles.mobileMonthlyPrice}>
            {en ? "from" : "თვეში:"} {Math.ceil((configuredPrice ?? product.pricing.effectivePrice) / 24)}₾ {en ? "/ month" : "-დან"}
          </span>
        </div>

        <button
          type="button"
          className={`${styles.mobileRoundAction} ${isCompared ? styles.mobileRoundActionActive : ""}`}
          onClick={handleCompare}
          aria-label={en ? "Compare" : "შედარება"}
          aria-pressed={isCompared}
        >
          <img src="/icons/Arrows.svg" alt="" />
        </button>
        <button
          type="button"
          className={styles.mobileRoundAction}
          onClick={handleAddToCart}
          disabled={!isAvailable || configuredPrice != null}
          aria-label={en ? "Add to cart" : "კალათაში დამატება"}
        >
          <img src="/icons/Cart.svg" alt="" />
        </button>
        <button
          type="button"
          className={styles.mobileBuyButton}
          onClick={handleBuyNow}
          disabled={!isAvailable || configuredPrice != null}
        >
          {isAvailable ? (en ? "Buy" : "ყიდვა") : (en ? "Out of stock" : "ამოწურულია")}
        </button>
      </div>
    </div>
  );
}
