import { useEffect, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

import Button from "../../components/common/button";
import Loading from "../../components/common/loading";
import ProductTable from "../../components/products/productTable";
import ProductModal from "../../components/products/productModal";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import {
  getProducts,
  createProduct,
  updateProduct,
} from "../../services/productApi";

import styles from "../../css/products.module.css";

function Products() {
  const [collapsed, setCollapsed] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const totalPages = 1;

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "========== LOAD PRODUCTS =========="
      );

      const response =
        await getProducts();

      console.log(
        "GET PRODUCTS RESPONSE:",
        response
      );

      const productData =
        response?.data || [];

      setProducts(productData);
    } catch (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil data produk"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PRODUCTS SAAT HALAMAN DIBUKA
  // ==========================================

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // ADD
  // ==========================================

  const handleAdd = () => {
    setSelectedProduct(null);
    setError("");
    setModalOpen(true);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setError("");
    setModalOpen(true);
  };

  // ==========================================
  // VIEW
  // ==========================================

  const handleView = (product) => {
    setSelectedProduct(product);
    setError("");
    setModalOpen(true);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = (product) => {
    console.log(
      "Delete:",
      product
    );
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (data) => {
    console.log(
      "========== SUBMIT PRODUCT =========="
    );

    console.log(
      "SUBMIT DATA:",
      data
    );

    try {
      setSaving(true);
      setError("");

      let response;

      // ======================================
      // CREATE
      // ======================================

      if (!selectedProduct) {
        console.log(
          "MODE: CREATE PRODUCT"
        );

        response =
          await createProduct(data);
      }

      // ======================================
      // UPDATE
      // ======================================

      else {
        console.log(
          "MODE: UPDATE PRODUCT"
        );

        response =
          await updateProduct(
            selectedProduct.id,
            data
          );
      }

      console.log(
        "PRODUCT API RESPONSE:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal menyimpan produk"
        );
      }

      console.log(
        "PRODUCT BERHASIL DISIMPAN"
      );

      // ======================================
      // CLOSE MODAL
      // ======================================

      setModalOpen(false);
      setSelectedProduct(null);

      // ======================================
      // REFRESH DATA
      // ======================================

      await loadProducts();
    } catch (error) {
      console.error(
        "========== SAVE PRODUCT ERROR =========="
      );

      console.error(
        "ERROR:",
        error
      );

      console.error(
        "MESSAGE:",
        error?.message
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "RESPONSE:",
        error?.response?.data
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal menyimpan produk"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    loadProducts();
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProducts =
    products.filter((product) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(keyword) ||
        product.code
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`${styles.mainContent} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        <Navbar />

        <main className={styles.page}>
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className={styles.header}>
            <div>
              <h1>Produk</h1>

              <p>
                Kelola seluruh data produk
                inventory.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              icon={Plus}
              onClick={handleAdd}
            >
              Tambah Produk
            </Button>
          </div>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* TOOLBAR */}
          {/* ================================= */}

          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
                placeholder="Cari produk..."
              />
            </div>

            <Button
              type="button"
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>

          {/* ================================= */}
          {/* TABLE */}
          {/* ================================= */}

          {loading ? (
            <Loading
              size="medium"
              text="Memuat produk..."
            />
          ) : (
            <ProductTable
              products={filteredProducts}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* ================================= */}
          {/* MODAL */}
          {/* ================================= */}

          <ProductModal
            isOpen={modalOpen}
            onClose={() => {
              if (!saving) {
                setModalOpen(false);
              }
            }}
            product={selectedProduct}
            loading={saving}
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </div>
  );
}

export default Products;

