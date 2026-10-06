import { Package, Boxes } from "lucide-react";

import styles from "../../css/requestSummary.module.css";

function RequestSummary({ items = [] }) {
  const totalProducts = items.length;

  const totalQuantity = items.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0),
    0
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <Package size={20} />
        </div>

        <div className={styles.content}>
          <span>Total Produk</span>
          <strong>{totalProducts}</strong>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.icon}>
          <Boxes size={20} />
        </div>

        <div className={styles.content}>
          <span>Total Quantity</span>
          <strong>{totalQuantity}</strong>
        </div>
      </div>
    </div>
  );
}

export default RequestSummary;