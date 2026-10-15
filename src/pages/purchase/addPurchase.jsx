import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PurchaseForm from "../../components/purchases/purchaseForm";
import { createPurchase } from "../../services/purchaseApi";
import { getProducts } from "../../services/productApi";
import { getSuppliers } from "../../services/supplierApi";

import styles from "../../css/addPurchase.module.css";

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getList(response, key) {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function AddPurchase() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      setError("");

      const [productResponse, supplierResponse] =
        await Promise.all([
          getProducts({ page: 1, limit: 100 }),
          getSuppliers({ page: 1, limit: 100 }),
        ]);

      setProducts(getList(productResponse, "products"));
      setSuppliers(getList(supplierResponse, "suppliers"));
    } catch (err) {
      console.error("Gagal memuat data pembelian:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil data produk dan supplier."
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  useState(() => {
    loadOptions();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      console.log("DATA PEMBELIAN:", data);

      const response = await createPurchase(data);

      console.log("CREATE PURCHASE RESPONSE:", response);

      navigate("/purchases");
    } catch (err) {
      console.error("Create purchase error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Gagal menambahkan pembelian.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Tambah Pembelian</h1>

          <p>
            Tambahkan transaksi pembelian barang dari supplier.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {loadingOptions ? (
          <p className={styles.loading}>
            Memuat data produk dan supplier...
          </p>
        ) : (
          <PurchaseForm
            products={products}
            suppliers={suppliers}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/purchases")}
          />
        )}
      </div>
    </main>
  );
}

export default AddPurchase;
