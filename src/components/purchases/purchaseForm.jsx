import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Trash2, Plus } from "lucide-react";

import Button from "../common/button";
import Loading from "../common/loading";

import { getSuppliers } from "../../services/supplierApi";
import { getProducts } from "../../services/productApi";

import styles from "../../css/purchaseForm.module.css";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialForm = {
  supplierId: "",
  purchaseDate: getTodayDate(),
  note: "",
};

function PurchaseForm({
  initialData = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKeyRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setSupplierLoading(true);
        setProductLoading(true);

        const [supplierResponse, productResponse] = await Promise.all([
          getSuppliers(),
          getProducts(),
        ]);

        if (!active) return;

        if (!supplierResponse?.success) {
          throw new Error(
            supplierResponse?.message || "Gagal mengambil data supplier",
          );
        }

        if (!productResponse?.success) {
          throw new Error(
            productResponse?.message || "Gagal mengambil data produk",
          );
        }

        setSuppliers(supplierResponse.data || []);

        const productData = productResponse.data;
        setProducts(
          Array.isArray(productData)
            ? productData
            : productData?.products || [],
        );
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Gagal mengambil data pembelian",
          );
        }
      } finally {
        if (active) {
          setSupplierLoading(false);
          setProductLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialData) {
      setFormData({
        ...initialForm,
        purchaseDate: getTodayDate(),
      });
      setItems([]);
      return;
    }

    const purchaseItems = initialData.items || initialData.purchaseItems || [];

    setFormData({
      supplierId: String(
        initialData.supplierId ?? initialData.supplier?.id ?? "",
      ),
      purchaseDate: initialData.purchaseDate
        ? String(initialData.purchaseDate).slice(0, 10)
        : getTodayDate(),
      note: initialData.note || initialData.description || "",
    });

    setItems(
      purchaseItems.map((item) => ({
        productId: Number(item.productId ?? item.product?.id),
        name: item.product?.name || item.name || "",
        code: item.product?.code || item.code || "",
        quantity: Number(item.quantity) || 1,
        unitPrice:
          Number(item.unitPrice ?? item.purchasePrice ?? item.price) || 0,
      })),
    );
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

const handleProductChange = (event) => {
  const productId = event.target.value;
  setSelectedProductId(productId);

  const product = products.find(
    (item) => Number(item.id) === Number(productId)
  );

  if (!product) {
    setUnitPrice("");
    setError("");
    return;
  }

  setUnitPrice(String(Number(product.price) || 0));

  if (product.supplierId) {
    const supplierExists = suppliers.some(
      (supplier) => Number(supplier.id) === Number(product.supplierId)
    );

    if (supplierExists) {
      setFormData((previous) => ({
        ...previous,
        supplierId: String(product.supplierId),
      }));
    }
  }

  setError("");
};


  const handleAddItem = () => {
    const productId = Number(selectedProductId);
    const itemQuantity = Number(quantity);
    const price = Number(unitPrice);

    if (!productId) {
      setError("Silakan pilih produk terlebih dahulu.");
      return;
    }

    if (!Number.isInteger(itemQuantity) || itemQuantity < 1) {
      setError("Jumlah pembelian minimal 1.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Harga beli harus berupa angka yang valid.");
      return;
    }

    const product = products.find((item) => Number(item.id) === productId);

    if (!product) {
      setError("Produk tidak ditemukan.");
      return;
    }

    setItems((previous) => {
      const existing = previous.find((item) => item.productId === productId);

      if (existing) {
        return previous.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + itemQuantity,
                unitPrice: price,
              }
            : item,
        );
      }

      return [
        ...previous,
        {
          productId,
          name: product.name,
          code: product.code || "",
          quantity: itemQuantity,
          unitPrice: price,
        },
      ];
    });

    setSelectedProductId("");
    setQuantity("1");
    setUnitPrice("");
    setError("");
  };

  const handleRemoveItem = (productId) => {
    setItems((previous) =>
      previous.filter((item) => item.productId !== productId),
    );
  };

  const handleItemChange = (productId, field, value) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) return item;

        if (value === "") {
          return { ...item, [field]: "" };
        }

        const numberValue = Number(value);

        return {
          ...item,
          [field]: numberValue,
        };
      }),
    );

    setError("");
  };

  const totalQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const totalAmount = items.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0,
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);


const handleSubmit = async (event) => {
  event.preventDefault();

  if (!formData.supplierId) {
    setError("Supplier wajib dipilih.");
    return;
  }

  if (!formData.purchaseDate) {
    setError("Tanggal pembelian wajib diisi.");
    return;
  }

  if (formData.purchaseDate > getTodayDate()) {
    setError("Tanggal pembelian tidak boleh di masa depan.");
    return;
  }

  if (items.length === 0) {
    setError("Tambahkan minimal satu produk.");
    return;
  }

  const invalidItem = items.some(
    (item) =>
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1 ||
      !Number.isFinite(Number(item.unitPrice)) ||
      Number(item.unitPrice) < 0
  );

  if (invalidItem) {
    setError("Periksa kembali jumlah dan harga beli setiap produk.");
    return;
  }

  if (typeof onSubmit !== "function") {
    setError("Fungsi penyimpanan pembelian belum tersedia.");
    return;
  }

  if (!idempotencyKeyRef.current) {
    idempotencyKeyRef.current = crypto.randomUUID();
  }

  const purchaseData = {
    supplierId: Number(formData.supplierId),
    purchaseDate: formData.purchaseDate,
    note: formData.note.trim() || null,
    items: items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
    idempotencyKey: idempotencyKeyRef.current,
  };

  try {
    setError("");
    await onSubmit(purchaseData);
    idempotencyKeyRef.current = null;
  } catch (err) {
    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Gagal menyimpan pembelian. Silakan coba kembali."
    );
  }
};


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="supplierId">Supplier</label>
<select
  id="supplierId"
  name="supplierId"
  value={formData.supplierId}
  onChange={handleChange}
  disabled
>
  <option value="">Pilih supplier</option>

  {suppliers.map((supplier) => (
    <option key={supplier.id} value={supplier.id}>
      {supplier.code
        ? `${supplier.code} - ${supplier.name}`
        : supplier.name}
    </option>
  ))}
</select>

          {!supplierLoading && suppliers.length === 0 && (
            <small>
              Belum ada supplier. Tambahkan supplier terlebih dahulu.
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="purchaseDate">Tanggal Pembelian</label>
          <input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            max={getTodayDate()}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className={styles.productSection}>
        <h3>Produk Pembelian</h3>

        <div className={styles.addProductGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="productId">Produk</label>
            <select
              id="productId"
              value={selectedProductId}
              onChange={handleProductChange}
              disabled={productLoading}
            >
              <option value="">
                {productLoading ? "Memuat produk..." : "Pilih produk"}
              </option>

              {products
                .filter((product) => product.status !== "INACTIVE")
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code
                      ? `${product.code} - ${product.name}`
                      : product.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="quantity">Jumlah</label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="unitPrice">Harga Beli</label>
            <input
              id="unitPrice"
              type="number"
              min="0"
              step="any"
              value={unitPrice}
              disabled
              placeholder="Harga per satuan"
            />
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleAddItem}
            disabled={productLoading}
          >
            <Plus size={16} />
            Tambah
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Jumlah</th>
                <th>Harga Beli</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyState}>
                    Belum ada produk yang ditambahkan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.code && <small>{item.code}</small>}
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleItemChange(
                            item.productId,
                            "quantity",
                            event.target.value,
                          )
                        }
                        aria-label={`Jumlah ${item.name}`}
                      />
                    </td>

                    <td>
                      <input
  type="number"
  min="0"
  step="any"
  value={item.unitPrice}
  disabled
  aria-label={`Harga beli ${item.name}`}
/>
                    </td>

                    <td>
                      {formatCurrency(
                        (Number(item.quantity) || 0) *
                          (Number(item.unitPrice) || 0),
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => handleRemoveItem(item.productId)}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.summary}>
        <div>
          <span>Jenis Produk</span>
          <strong>{items.length} produk</strong>
        </div>

        <div>
          <span>Total Kuantitas</span>
          <strong>{totalQuantity}</strong>
        </div>

        <div>
          <span>Total Pembelian</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="note">Keterangan</label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Masukkan keterangan pembelian, nomor faktur, atau catatan lainnya"
          rows="3"
        />
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={styles.cancelButton}
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className={styles.submitButton}
        >
          {loading ? "Menyimpan..." : "Submit Pembelian"}
        </button>
      </div>
    </form>
  );
}

PurchaseForm.propTypes = {
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};

export default PurchaseForm;
