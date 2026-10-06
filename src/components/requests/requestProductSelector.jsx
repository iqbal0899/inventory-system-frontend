import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "../common/button";

import styles from "../../css/requestProductSelector.module.css";

function RequestProductSelector({
  products = [],
  items = [],
  loading = false,
  onAdd,
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const activeProducts = products.filter(
    (product) =>
      product.status === "ACTIVE" ||
      product.status === "active" ||
      !product.status
  );

  const selectedProduct = activeProducts.find(
    (product) =>
      Number(product.id) === Number(productId)
  );

  const existingItem = items.find(
    (item) =>
      Number(item.productId) === Number(productId)
  );

  const handleAdd = () => {
    const id = Number(productId);
    const qty = Number(quantity);

    if (!id || !qty || qty <= 0) {
      return;
    }

    if (!selectedProduct) {
      return;
    }

    onAdd?.(id, qty);

    setProductId("");
    setQuantity(1);
  };

  const handleProductChange = (event) => {
    setProductId(event.target.value);
    setQuantity(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>Tambah Produk</h3>

          <p>
            Pilih produk dari data produk dan tentukan
            jumlah stok yang dibutuhkan.
          </p>
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="request-product">
            Produk
          </label>

          <select
            id="request-product"
            value={productId}
            onChange={handleProductChange}
            disabled={loading}
          >
            <option value="">
              {loading
                ? "Memuat produk..."
                : "Pilih produk"}
            </option>

            {!loading &&
              activeProducts.map((product) => {
                const alreadyAdded = items.some(
                  (item) =>
                    Number(item.productId) ===
                    Number(product.id)
                );

                return (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.code
                      ? `${product.code} - ${product.name}`
                      : product.name}
                    {alreadyAdded
                      ? " (Sudah ditambahkan)"
                      : ""}
                  </option>
                );
              })}
          </select>

          {!loading && activeProducts.length === 0 && (
            <span className={styles.helper}>
              Tidak ada produk aktif.
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="request-quantity">
            Jumlah
          </label>

          <div className={styles.quantityWrapper}>
            <input
              id="request-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              disabled={loading || !selectedProduct}
            />

            {selectedProduct?.unit && (
              <span>{selectedProduct.unit}</span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={handleAdd}
          disabled={
            loading ||
            !selectedProduct ||
            !quantity ||
            Number(quantity) <= 0
          }
        >
          Tambah
        </Button>
      </div>

      {selectedProduct && (
        <div className={styles.productInfo}>
          <div>
            <span>Kode Produk</span>
            <strong>
              {selectedProduct.code || "-"}
            </strong>
          </div>

          <div>
            <span>Produk</span>
            <strong>{selectedProduct.name}</strong>
          </div>

          <div>
            <span>Stok Saat Ini</span>
            <strong>
              {selectedProduct.stock ?? 0}{" "}
              {selectedProduct.unit || "unit"}
            </strong>
          </div>

          <div>
            <span>Minimal Stok</span>
            <strong>
              {selectedProduct.minStock ?? 0}{" "}
              {selectedProduct.unit || "unit"}
            </strong>
          </div>

          {existingItem && (
            <div>
              <span>Request Saat Ini</span>
              <strong>
                {existingItem.quantity}{" "}
                {selectedProduct.unit || "unit"}
              </strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RequestProductSelector;