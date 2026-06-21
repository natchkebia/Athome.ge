import styles from "./Configurator.module.scss";
import { SelectedConfiguratorProduct } from "./configuratorTypes";

type Props = {
  selectedProducts: Record<string, SelectedConfiguratorProduct[] | undefined>;
  totalPrice: number;
  onSaveConfiguration: () => void;
  onAddToCart: () => void;
  saving?: boolean;
  addingToCart?: boolean;
};

export default function ConfiguratorSummary({
  selectedProducts,
  totalPrice,
  onSaveConfiguration,
  onAddToCart,
  saving = false,
  addingToCart = false,
}: Props) {
  const products = Object.values(selectedProducts).flatMap(
    (categoryProducts) => categoryProducts || []
  );

  return (
    <div className={styles.summaryColumn}>
      <aside className={styles.summary}>
        <div className={styles.summaryImage}>
          <img src="/images/case.svg" alt="PC Case" />
        </div>

        <div className={styles.total}>
          <strong>{totalPrice} ₾</strong>
          <span>კონფიგურაციის ჯამი</span>
        </div>
      </aside>

      <div className={styles.summaryActions}>
        <div>
          <button type="button" onClick={onSaveConfiguration} disabled={saving}>
            <img src="/images/conf1.svg" alt="configurator" />
            <span>{saving ? "ინახება..." : "კონფიგურაციის შენახვა"}</span>
          </button>
        </div>

        <div>
          <button type="button">
            <img src="/images/conf2.svg" alt="configurator" />
            <span>კონფიგურაციის ჩამოტვირთვა</span>
          </button>
        </div>

        <div>
          <button type="button" onClick={onAddToCart} disabled={addingToCart}>
            <img src="/images/conf3.svg" alt="configurator" />
            <span>{addingToCart ? "ემატება..." : "კალათაში დამატება"}</span>
          </button>
        </div>

        <div>
          <button type="button">
            <img src="/images/conf4.svg" alt="configurator" />
            <span>მზა კონფიგურაციები</span>
          </button>
        </div>
      </div>

      <div className={styles.selectedList}>
        {products.length === 0 ? (
          <p>ჯერ არცერთი ნაწილი არ არის არჩეული</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className={styles.selectedItem}>
              <span>
                {product.title} × {product.quantity}
              </span>

              <strong>{product.price * product.quantity} ₾</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
