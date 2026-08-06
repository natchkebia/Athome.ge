"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

interface Spec {
  label: string;
  value: string;
}

interface SpecGroup {
  name: string;
  fields: Spec[];
}

// componentType (backend enum) → ქართული სათაური. ენუმი შეიძლება გაიზარდოს —
// უცნობ ტიპს ვტოვებთ (არ ვხატავთ), ვიდრე მცდარ სათაურს ვაჩვენებდეთ.
const COMPONENT_TYPE_HEADINGS: Record<string, string> = {
  Cpu: "პროცესორები",
  Motherboard: "დედაპლატები",
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

export default function ProductDetail({
  product,
  routeCategory,
  routeSlug,
}: ProductDetailProps) {
  const en = useStorefrontLocale() === "en";
  const [showAll, setShowAll] = useState(false);
  const [showFullShortDescription, setShowFullShortDescription] = useState(false);
  const [isShortDescriptionOverflowing, setIsShortDescriptionOverflowing] =
    useState(false);
  const shortDescriptionRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCommerce();
  const { toggleCompare, compareIds, maxItems } = useCompare();
  const { showToast } = useToast();
  const router = useRouter();
  const isCompared = compareIds.has(product.id);
  const [fallbackRelatedProducts, setFallbackRelatedProducts] = useState<
    StorefrontProductCard[]
  >([]);
  const images =
    product.images.length > 0
      ? [...product.images]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => normalizeMediaUrl(image.url))
      : ["/images/discountPc.png"];
  // Backend აბრუნებს ჯგუფებსა და ველებს ჩვენების რიგით — არ ვახარისხებთ.
  const specGroups: SpecGroup[] =
    product.specifications.length > 0
      ? product.specifications.map((group) => ({
          name: group.name || (en ? "Specifications" : "მახასიათებლები"),
          fields: (group.fields ?? []).map((field) => ({
            label: `${field.label}:`,
            value: field.value || "-",
          })),
        }))
      : [
          {
            name: en ? "General" : "ძირითადი",
            fields: [
              { label: en ? "Brand:" : "ბრენდი:", value: product.brand.name },
              { label: en ? "Model:" : "მოდელი:", value: product.model || product.sku },
              { label: en ? "Category:" : "კატეგორია:", value: product.category.name },
              ...(product.subCategory
                ? [{ label: en ? "Type:" : "ტიპი:", value: product.subCategory.name }]
                : []),
              { label: en ? "Stock:" : "მარაგი:", value: product.stockStatus },
              {
                label: en ? "Quantity:" : "რაოდენობა:",
                value: String(product.totalEffectiveQuantity),
              },
            ],
          },
        ];

  // პირველი ჯგუფი ყოველთვის ჩანს; დანარჩენი — "მეტი დეტალი"-ს უკან.
  const primaryGroups = specGroups.slice(0, 1);
  const collapsibleGroups = specGroups.slice(1);

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
  const relatedProducts =
    product.relatedProducts.length > 0
      ? product.relatedProducts.map(mapStorefrontProductToCard)
      : fallbackRelatedProducts;
  const oldPrice =
    product.pricing.sellingPrice > product.pricing.effectivePrice
      ? product.pricing.sellingPrice
      : undefined;

  useEffect(() => {
    let isMounted = true;

    if (product.relatedProducts.length > 0) {
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
  }, [product.category.slug, product.relatedProducts.length, product.slug]);

  useEffect(() => {
    setShowFullShortDescription(false);
    setIsShortDescriptionOverflowing(false);
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
    });

  // "ყიდვა" — ამატებს კალათაში და გადაჰყავს კალათის გვერდზე (სტუმარსაც).
  const handleBuyNow = async () => {
    cacheInfo();
    await addToCart(product.id);
    router.push("/basket");
  };

  // "დამატება" — ამატებს კალათაში, სურათი კალათისკენ ფრინავს, აჩვენებს დადასტურებას.
  const handleAddToCart = async (event: React.MouseEvent) => {
    const sourceEl = event.currentTarget as HTMLElement;
    cacheInfo();
    flyToTarget(sourceEl, images[0], "cart");
    await addToCart(product.id);
    showToast(en ? "Added to cart" : "კალათაში დაემატა");
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

    if (result === "added") showToast(en ? "Added to comparison" : "შედარების სიაში დაემატა");
    else if (result === "removed") showToast(en ? "Removed from comparison" : "შედარების სიიდან ამოიშალა");
    else showToast(en ? `You can compare up to ${maxItems} products` : `შედარებაში მაქსიმუმ ${maxItems} პროდუქტია`, "error");
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
                {en ? "Stock in stores:" : "მარაგი ფილიალებში:"} <StockCheck productId={String(product.id)} />
              </div>
              <p>
                {en ? "Product code:" : "პროდუქტის კოდი:"} <span>{product.id}</span>
              </p>
              <p>
                {en ? "Manufacturer code:" : "მწარმოებლის კოდი:"}<span> {product.sku}</span>
              </p>
              <p>
                {en ? "Brand:" : "ბრენდი:"} <span>{product.brand.name}</span>
              </p>
              <p>{en ? "Model:" : "მოდელი:"} {product.model && <span>{product.model}</span>}</p>
              <p>
                {en ? "Type:" : "ტიპი:"} <span> {product.subCategory?.name || product.category.name}</span>
              </p>
            </div>
          </div>

          <div className={styles.priceWrapper}>
            <div className={styles.prices}>
              <div className={styles.priceContainer}>
                <span className={styles.newPrice}>
                  {product.pricing.effectivePrice.toFixed(2)} ₾
                </span>
                {oldPrice && (
                  <span className={styles.oldPrice}>
                    {oldPrice.toFixed(2)} ₾
                  </span>
                )}
              </div>
              <button onClick={handleBuyNow}>{en ? "Buy now" : "ყიდვა"}</button>
            </div>

            <div className={styles.actions}>
              <button className={styles.buyBtn} onClick={handleAddToCart}>
                <img src="/icons/Cart.svg" alt="Cart.svg" />
                <span>{en ? "Add to cart" : "დამატება"}</span>
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

            <div className={styles.badges}>
              <img src="/icons/Tbc.svg" alt="Tbc.svg" />
              <img src="/icons/Bank_of_Georgia.svg" alt="Bank_of_Georgia.svg" />
              <img src="/icons/kredo.svg" alt="kredo.svg" />
            </div>
          </div>
        </div>
      </div>

      {product.descriptionHtml && (
        <section className={styles.descriptionSection}>
          <h4>{en ? "Product description" : "პროდუქტის აღწერა"}</h4>
          <div
            className={styles.richText}
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(product.descriptionHtml),
            }}
          />
        </section>
      )}

      <div className={styles.specsSectionWrapper}>
        <h4>{en ? "Additional specifications" : "დამატებითი მახასიათებლები"}</h4>
        <div className={styles.specsSection}>
          <table>
            <tbody>
              {primaryGroups.map((group, gi) => (
                <Fragment key={`pg-${gi}`}>
                  <tr>
                    <th
                      colSpan={2}
                      className={`${styles.sectionTitle} ${styles.first}`}
                    >
                      {group.name}
                    </th>
                  </tr>
                  {group.fields.map((spec, i) => (
                    <tr key={`pg-${gi}-${i}`}>
                      <th>{spec.label}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}

              {/* დანარჩენი ჯგუფები — მხოლოდ showAll=true-ზე */}
              {showAll &&
                collapsibleGroups.map((group, gi) => (
                  <Fragment key={`cg-${gi}`}>
                    <tr>
                      <th colSpan={2} className={styles.sectionTitle}>
                        {group.name}
                      </th>
                    </tr>
                    {group.fields.map((spec, i) => (
                      <tr key={`cg-${gi}-${i}`}>
                        <th>{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
            </tbody>
          </table>

          {/* ღილაკი მეტის/ნაკლების ჩვენებისთვის */}
          {collapsibleGroups.length > 0 && (
            <button
              className={styles.toggleBtn}
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? (en ? "Fewer details" : "ნაკლები დეტალი") : (en ? "More details" : "მეტი დეტალი")}
            </button>
          )}
        </div>
      </div>

      {(keyFeatures.length > 0 || boxContents.length > 0) && (
        <div className={styles.infoBlocks}>
          {keyFeatures.length > 0 && (
            <div className={styles.infoCard}>
              <h4>{en ? "Key features" : "ძირითადი მახასიათებლები"}</h4>
              <ul>
                {keyFeatures.map((item, i) => (
                  <li key={`kf-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {boxContents.length > 0 && (
            <div className={styles.infoCard}>
              <h4>{en ? "What's in the box" : "შეფუთვის შემადგენლობა"}</h4>
              <ul>
                {boxContents.map((item, i) => (
                  <li key={`bc-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
