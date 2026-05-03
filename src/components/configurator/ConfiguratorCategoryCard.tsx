import styles from "./Configurator.module.scss";
import {
  ConfiguratorCategory,
  SelectedConfiguratorProduct,
} from "./configuratorTypes";

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
          aria-label="პროდუქტის წაშლა"
        >
          ×
        </button>
      )}

      <button type="button" className={styles.cardBody} onClick={onClick}>
        <img
          src={firstSelectedProduct?.image || category.icon}
          alt={firstSelectedProduct?.title || category.title}
        />

        <h3>{category.title}</h3>

        {hasSelectedProducts ? (
          <>
            <p className={styles.selectedTitle}>
              არჩეულია {selectedProducts.length} პროდუქტი
              <br />
              სულ {totalQuantity} ერთეული
            </p>

            <span className={styles.price}>{totalPrice} ₾</span>
          </>
        ) : (
          <span className={styles.addText}>დამატება</span>
        )}
      </button>
    </div>
  );
}