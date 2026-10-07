import { useCallback, useEffect, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";

import Button from "../../components/common/button";
import Loading from "../../components/common/loading";
import Modal from "../../components/common/modal";
import StockTable from "../../components/stock/stockMovmentTable";
import StockAdjustment from "../../components/stock/stockAdjusment";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import {
  getStocks,
  stockIn,
  stockOut,
} from "../../services/stockApi";

import styles from "../../css/stock.module.css";

function Stock() {
  const [collapsed, setCollapsed] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustmentLoading, setAdjustmentLoading] =
    useState(false);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState(null);
  const [adjustmentOpen, setAdjustmentOpen] =
    useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(products.length / itemsPerPage)
  );

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStocks();

      setProducts(response?.data || []);
    } catch (error) {
      console.error(
        "Gagal mengambil data stok:",
        error
      );

      setProducts([]);

      setError(
        error?.response?.data?.message ||
          "Gagal memuat data stok."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const handleView = (product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleAdjustment = () => {
    setDetailOpen(false);
    setAdjustmentOpen(true);
  };

  const handleSubmitAdjustment = async (data) => {
    try {
      setAdjustmentLoading(true);
      setError("");

      if (data.type === "add") {
        await stockIn(data.productId, {
          quantity: data.quantity,
          note: data.note,
        });
      } else {
        await stockOut(data.productId, {
          quantity: data.quantity,
          note: data.note,
        });
      }

      setAdjustmentOpen(false);
      setSelectedProduct(null);

      await loadStocks();
    } catch (error) {
      console.error(
        "Gagal melakukan penyesuaian stok:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Gagal melakukan penyesuaian stok."
      );
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadStocks();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
          <div className={styles.header}>
            <div>
              <h1>Stok</h1>
              <p>
                Pantau dan sesuaikan stok produk.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {loading ? (
            <Loading
              size="medium"
              text="Memuat stok..."
            />
          ) : (
            <StockTable
              products={products}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onView={handleView}
            />
          )}

          <Modal
            isOpen={detailOpen}
            onClose={() => setDetailOpen(false)}
            title="Detail Stok"
            size="small"
          >
            {selectedProduct && (
              <div className={styles.detail}>
                <div>
                  <span>Produk</span>
                  <strong>
                    {selectedProduct.name}
                  </strong>
                </div>

                <div>
                  <span>Kode</span>
                  <strong>
                    {selectedProduct.code || "-"}
                  </strong>
                </div>

                <div>
                  <span>Stok</span>
                  <strong>
                    {selectedProduct.stock ?? 0} unit
                  </strong>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  icon={SlidersHorizontal}
                  fullWidth
                  onClick={handleAdjustment}
                >
                  Sesuaikan Stok
                </Button>
              </div>
            )}
          </Modal>

          <StockAdjustment
            isOpen={adjustmentOpen}
            onClose={() => {
              if (!adjustmentLoading) {
                setAdjustmentOpen(false);
              }
            }}
            product={selectedProduct}
            loading={adjustmentLoading}
            onSubmit={handleSubmitAdjustment}
          />
        </main>
      </div>
    </div>
  );
}

export default Stock;