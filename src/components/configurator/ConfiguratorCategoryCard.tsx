import styles from "./Configurator.module.scss";
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
  "SSD მეხსიერება": "SSD storage", "ქეისის ქულერი": "Case fan", "სისტემის ლიცენზია": "System license",
  მონიტორი: "Monitor", ყურსასმენი: "Headset", კლავიატურა: "Keyboard", მაუსი: "Mouse",
  მიკროფონი: "Microphone", დინამიკი: "Speakers",
};

type Props = {
  category: ConfiguratorCategory;
  selectedProducts: SelectedConfiguratorProduct[];
  onClick: () => void;
  onRemove: () => void;
};

export default function ConfiguratorCategoryCard({
  category,
  selectedProducts,
  onClick,
  onRemove,
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
    <div className={styles.categoryCard}>
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

      <button type="button" className={styles.cardBody} onClick={onClick}>
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
            <p className={styles.selectedTitle}>
              {en ? `${selectedProducts.length} selected` : `არჩეულია ${selectedProducts.length} პროდუქტი`}
              <br />
              {en ? `${totalQuantity} units total` : `სულ ${totalQuantity} ერთეული`}
            </p>

            <span className={styles.price}>{totalPrice} ₾</span>
          </>
        ) : (
          <span className={styles.addText}>{en ? "Add" : "დამატება"}</span>
        )}
      </button>
    </div>
  );
}
