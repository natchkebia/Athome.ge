import styles from "./Configurator.module.scss";
import Link from "next/link";
import ProductThumb from "./ProductThumb";
import {
  ConfiguratorCategory,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

const EN_TITLES: Record<string, string> = {
  პროცესორი: "Processor", "დედა დაფა": "Motherboard", "ოპერატიული მეხსიერება": "Memory",
  ვიდეოკარტა: "Graphics card", ვიდეობარათი: "Graphics card", "კვების ბლოკი": "Power supply",
  "პროცესორის გამაგრილებელი": "CPU cooler", ქეისი: "Case", "მყარი დისკი": "Hard drive",
  "პროცესორის ქულერი (ჰაერის)": "Air CPU cooler", "თხევადი გაგრილება": "Liquid cooling",
  "SSD მეხსიერება": "SSD storage", "ქეისის ქულერი": "Case fan", "სისტემის ლიცენზია": "System license",
  მონიტორი: "Monitor", ყურსასმენი: "Headset", კლავიატურა: "Keyboard", მაუსი: "Mouse",
  მიკროფონი: "Microphone", დინამიკი: "Speakers",
};

type Props = {
  category: ConfiguratorCategory;
  selectedProducts: SelectedConfiguratorProduct[];
  onClick: () => void;
  onRemove: () => void;
  disabled?: boolean;
  restrictionMessage?: string;
  compatibilityIssue?: string;
};

export default function ConfiguratorCategoryCard({
  category,
  selectedProducts,
  onClick,
  onRemove,
  disabled = false,
  restrictionMessage,
  compatibilityIssue,
}: Props) {
  const en = useStorefrontLocale() === "en";
  const title = en ? EN_TITLES[category.title] ?? category.title : category.title;
  const totalQuantity = selectedProducts.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const totalPrice = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const firstSelectedProduct = selectedProducts[0];
  const hasSelectedProducts = selectedProducts.length > 0;

  return (
    <div className={`${styles.categoryCard} ${disabled ? styles.categoryCardDisabled : ""} ${compatibilityIssue ? styles.categoryCardConflict : ""}`}>
      {hasSelectedProducts && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={en ? "Remove product" : "პროდუქტის წაშლა"}
        >
          ×
        </button>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`${styles.cardBody} ${hasSelectedProducts ? styles.selectedCardBody : ""}`}
        onClick={() => {
          if (!disabled) onClick();
        }}
        onKeyDown={(event) => {
          if (disabled || event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {firstSelectedProduct ? (
          <ProductThumb
            key={firstSelectedProduct.id}
            src={firstSelectedProduct.image}
            alt={firstSelectedProduct.title}
          />
        ) : (
          <img src={category.icon} alt={title} />
        )}

        <h3>{title}</h3>

        {hasSelectedProducts ? (
          <>
            <div className={styles.selectedProductsViewport}>
              {selectedProducts.map((product, index) => (
                <span className={styles.selectedProductIdentity} key={product.id}>
                  <small>
                    {en ? `Selected model ${index + 1}` : `არჩეული მოდელი ${index + 1}`}
                  </small>
                  {product.slug ? (
                    <Link
                      href={`/products/search/${encodeURIComponent(product.slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.selectedProductLink}
                      title={product.title}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {product.title}
                    </Link>
                  ) : (
                    <strong title={product.title}>{product.title}</strong>
                  )}
                </span>
              ))}
            </div>

            <p className={styles.selectedTitle}>
              {en ? `${selectedProducts.length} selected` : `არჩეულია ${selectedProducts.length} პროდუქტი`}
              <br />
              {en ? `${totalQuantity} units total` : `სულ ${totalQuantity} ერთეული`}
            </p>

            <span className={styles.price}>{totalPrice} ₾</span>
            {category.acceptsMultiple && (
              <span className={styles.addText}>{en ? "Add another" : "კიდევ ერთის დამატება"}</span>
            )}
          </>
        ) : (
          <span className={styles.addText}>{en ? "Add" : "დამატება"}</span>
        )}

        {restrictionMessage && (
          <span className={styles.cardRestriction}>{restrictionMessage}</span>
        )}
        {compatibilityIssue && (
          <span className={styles.categoryIssue}>{compatibilityIssue}</span>
        )}
      </div>
    </div>
  );
}
