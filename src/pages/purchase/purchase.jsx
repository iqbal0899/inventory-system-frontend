import { useCallback, useEffect, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

import Button from "../../components/common/button";
import Loading from "../../components/common/loading";
import PurchaseTable from "../../components/purchases/purchaseTable";
import PurchaseForm from "../../components/purchases/purchaseForm";
import ProductModal from "../../components/products/productModal";
import PurchaseDetail from "../../components/purchases/purchaseDetail";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import {
  getPurchases,
  createPurchase,
  receivePurchase,
  cancelPurchase,
} from "../../services/purchaseApi";

import {
  getProducts,
  createProduct,
  updateProduct,
} from "../../services/productApi";

import { getSuppliers } from "../../services/supplierApi";
import { useAuth } from "../../hooks/useAuth";

import styles from "../../css/purchase.module.css";

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getList(response, key) {
  const data = getResponseData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function Purchases() {
  const {user} = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [cancelPurchaseId, setCancelPurchaseId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [error, setError] = useState("");

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const canManagePurchases = [
    "ADMIN",
    "SUPER_ADMIN",
  ].includes(String(user?.role ?? "").toUpperCase());

  const loadProducts = useCallback(async () => {
    const response = await getProducts({
      page: 1,
      limit: 100,
    });

    setProducts(getList(response, "products"));
  }, []);

  const loadSuppliers = useCallback(async () => {
    const response = await getSuppliers({
      page: 1,
      limit: 100,
    });

    setSuppliers(getList(response, "suppliers"));
  }, []);

  const loadPurchases = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await getPurchases({
        page,
        limit: 10,
      });

      const data = getResponseData(response);

      if (Array.isArray(data)) {
        setPurchases(data);
        setTotalPages(1);
        return;
      }

      const list = Array.isArray(data?.purchases)
        ? data.purchases
        : Array.isArray(data?.data?.purchases)
          ? data.data.purchases
          : [];

      const pagination = data?.pagination ?? data?.data?.pagination ?? {};

      setPurchases(list);
      setTotalPages(Math.max(Number(pagination.totalPages) || 1, 1));
    } catch (err) {
      console.error("Gagal mengambil data pembelian:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengambil data pembelian.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInitialOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);

      const results = await Promise.allSettled([
        loadProducts(),
        loadSuppliers(),
      ]);

      if (results.some((result) => result.status === "rejected")) {
        setError("Sebagian data produk atau supplier gagal dimuat.");
      }
    } finally {
      setLoadingOptions(false);
    }
  }, [loadProducts, loadSuppliers]);

  useEffect(() => {
    loadInitialOptions();
  }, [loadInitialOptions]);

  useEffect(() => {
    loadPurchases(currentPage);
  }, [loadPurchases, currentPage]);

  const handleRefresh = async () => {
    setError("");

    await Promise.all([loadInitialOptions(), loadPurchases(currentPage)]);
  };

  const handleAddStock = () => {
    setError("");
    setFormOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      const response = selectedProduct
        ? await updateProduct(selectedProduct.id, data)
        : await createProduct(data);

      const result = response?.data ?? response;

      if (result?.success === false) {
        throw new Error(result.message || "Gagal menyimpan produk");
      }

      setModalOpen(false);
      setSelectedProduct(null);

      await loadProducts();
    } catch (err) {
      console.error("Gagal menyimpan produk:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan produk.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      setSaving(true);
      setError("");

      await createPurchase(data);

      setFormOpen(false);
      setCurrentPage(1);

      await loadPurchases(1);
    } catch (err) {
      console.error("Gagal membuat pembelian:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Gagal membuat pembelian.";

      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (purchase) => {
    if (!purchase?.id || processingId !== null) return;

    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menerima pembelian ini? Stok akan ditambahkan.",
    );

    if (!confirmed) return;

    try {
      setProcessingId(purchase.id);
      setError("");

      await receivePurchase(purchase.id);
      await loadPurchases(currentPage);
    } catch (err) {
      console.error("Gagal menerima pembelian:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal menerima pembelian.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenCancel = (purchase) => {
    if (!purchase?.id) return;

    setCancelPurchaseId(purchase.id);
    setCancelReason("");
    setError("");
  };

  const handleCancelPurchase = async () => {
    if (!cancelPurchaseId || processingId !== null) return;

    if (!cancelReason.trim()) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }

    try {
      setProcessingId(cancelPurchaseId);
      setError("");

      await cancelPurchase(cancelPurchaseId, {
        reason: cancelReason.trim(),
      });

      setCancelPurchaseId(null);
      setCancelReason("");

      await loadPurchases(currentPage);
    } catch (err) {
      console.error("Gagal membatalkan pembelian:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal membatalkan pembelian.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(Number(page) || 1, totalPages));

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    const code =
      purchase.code ||
      purchase.purchaseNumber ||
      `PO-${String(purchase.id || "").padStart(6, "0")}`;

    const supplierName = purchase.supplier?.name || purchase.supplierName || "";

    const status = purchase.status || "";

    return (
      String(code).toLowerCase().includes(keyword) ||
      String(supplierName).toLowerCase().includes(keyword) ||
      String(status).toLowerCase().includes(keyword)
    );
  });

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`${styles.mainContent} ${collapsed ? styles.collapsed : ""}`}
      >
        <Navbar />

        <main className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1>Pembelian</h1>
              <p>Kelola pembelian barang dari supplier dan penerimaan stok.</p>
            </div>

            <div className={styles.headerActions}>
              <Button
                type="button"
                variant="primary"
                icon={Plus}
                onClick={handleAddStock}
                disabled={saving || loadingOptions}
              >
                Tambah Stok
              </Button>

              <Button
                type="button"
                variant="primary"
                icon={Plus}
                onClick={handleAddProduct}
              >
                Tambah Produk
              </Button>
            </div>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={18} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kode, supplier, atau status..."
              />
            </div>

            <Button
              type="button"
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={loading || saving || processingId !== null}
            >
              Refresh
            </Button>
          </div>

          {loading && purchases.length === 0 ? (
            <Loading size="medium" text="Memuat data pembelian..." />
          ) : (
            <PurchaseTable
              purchases={filteredPurchases}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              processingId={processingId}
              onPageChange={handlePageChange}
              onView={(purchase) => setSelectedPurchase(purchase)}
              onReceive={handleReceive}
              onCancel={handleOpenCancel}
              canManagePurchases={canManagePurchases}
            />
          )}

          {selectedPurchase && (
            <PurchaseDetail
              purchase={selectedPurchase}
              onClose={() => setSelectedPurchase(null)}
            />
          )}

          {formOpen && (
            <div className={styles.formOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <div>
                    <h2>Buat Pembelian</h2>
                    <p>Pilih supplier dan masukkan barang yang akan dibeli.</p>
                  </div>

                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => {
                      if (!saving) {
                        setFormOpen(false);
                        setError("");
                      }
                    }}
                    disabled={saving}
                    aria-label="Tutup form pembelian"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className={styles.error} role="alert">
                    {error}
                  </div>
                )}

                {loadingOptions ? (
                  <Loading size="medium" text="Memuat produk dan supplier..." />
                ) : (
                  <PurchaseForm
                    products={products}
                    suppliers={suppliers}
                    loading={saving}
                    onSubmit={handleCreate}
                    onCancel={() => {
                      if (!saving) {
                        setFormOpen(false);
                        setError("");
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {cancelPurchaseId !== null && (
            <div className={styles.formOverlay}>
              <div className={styles.formModal}>
                <div className={styles.formHeader}>
                  <div>
                    <h2>Batalkan Pembelian</h2>
                    <p>Masukkan alasan pembatalan pembelian.</p>
                  </div>

                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => {
                      if (processingId === null) {
                        setCancelPurchaseId(null);
                        setCancelReason("");
                        setError("");
                      }
                    }}
                    disabled={processingId !== null}
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                </div>

                <div style={{ padding: 24 }}>
                  {error && (
                    <div className={styles.error} role="alert">
                      {error}
                    </div>
                  )}

                  <label
                    htmlFor="cancelReason"
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    Alasan Pembatalan
                  </label>

                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Masukkan alasan pembatalan..."
                    rows={4}
                    disabled={processingId !== null}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      resize: "vertical",
                      font: "inherit",
                      boxSizing: "border-box",
                    }}
                  />

                  <div
                    className={styles.headerActions}
                    style={{ marginTop: 16 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCancelPurchaseId(null);
                        setCancelReason("");
                        setError("");
                      }}
                      disabled={processingId !== null}
                    >
                      Kembali
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleCancelPurchase}
                      disabled={processingId !== null}
                    >
                      {processingId !== null
                        ? "Memproses..."
                        : "Konfirmasi Pembatalan"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

export default Purchases;
