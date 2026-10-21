import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductForm from "../../components/products/productForm";
import Loading from "../../components/common/loading";

import {
  getProductById,
  updateProduct,
} from "../../services/productApi";

import styles from "../../css/editProduct.module.css";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setProductLoading(true);
        setError("");

        const response = await getProductById(id);

        setProduct(response?.data || null);
      } catch (error) {
        console.error(
          "GET PRODUCT ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Gagal mengambil data produk"
        );
      } finally {
        setProductLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "UPDATE PRODUCT DATA:",
        data
      );

      const response = await updateProduct(
        id,
        {
          ...data,
          status:
            data.status === "ACTIVE"
              ? "ACTIVE"
              : "INACTIVE",
        }
      );

      console.log(
        "UPDATE PRODUCT RESPONSE:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal memperbarui produk"
        );
      }

      navigate("/products");
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal memperbarui produk"
      );
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <Loading
        fullPage
        text="Memuat data produk..."
      />
    );
  }

  if (!product) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p>
            {error || "Produk tidak ditemukan."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Edit Produk</h1>
          <p>
            Perbarui informasi produk.
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.card}>
        <ProductForm
          initialData={product}
          loading={loading}
          disableStock
          onSubmit={handleSubmit}
          onCancel={() =>
            navigate("/products")
          }
        />
      </div>
    </main>
  );
}

export default EditProduct;