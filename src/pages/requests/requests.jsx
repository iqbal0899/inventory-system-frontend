import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";

import Button from "../../components/common/button";
import Loading from "../../components/common/loading";
import RequestTable from "../../components/requests/requestTable";
import RequestAction from "../../components/requests/requestAction";
import RequestDetail from "../../components/requests/requestDetail";
import RequestForm from "../../components/requests/requestForm";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import { getProducts } from "../../services/productApi";

import {
  getRequests,
  createRequest,
  approveRequest,
  rejectRequest,
} from "../../services/requestApi";

import styles from "../../css/requests.module.css";

function Request() {
  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = useCallback(async () => {
    try {
      setProductLoading(true);

      const response = await getProducts({
        page: 1,
        limit: 100,
      });

      const data =
        response?.data?.products ??
        response?.data?.data?.products ??
        response?.data?.data ??
        response?.data ??
        response?.products ??
        [];

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async (page = 1) => {
    try {
      setLoading(true);

      const response = await getRequests({
        page,
        limit: 10,
      });

      const data = response?.data?.data ?? response?.data;

      if (Array.isArray(data)) {
        setRequests(data);
        setTotalPages(1);
        return;
      }

      setRequests(
        Array.isArray(data?.requests) ? data.requests : []
      );

      setTotalPages(
        Math.max(Number(data?.pagination?.totalPages) || 1, 1)
      );
    } catch (error) {
      console.error("Gagal mengambil data request:", error);
      console.error("Response:", error.response?.data);

      setRequests([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([
      loadProducts(),
      loadRequests(currentPage),
    ]);
  }, [loadProducts, loadRequests, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleView = (request) => {
    setSelectedRequest(request);
  };

  const handleAction = (type, request) => {
    setAction(type);
    setSelectedRequest(request);
  };

  const handleConfirm = async (reason) => {
    if (!selectedRequest?.id || !action) {
      alert("Data request atau aksi tidak valid");
      return;
    }

    try {
      setLoading(true);

      if (action === "approve") {
        await approveRequest(selectedRequest.id);
      } else if (action === "reject") {
        if (typeof reason !== "string" || !reason.trim()) {
          alert("Alasan penolakan wajib diisi");
          return;
        }

        await rejectRequest(selectedRequest.id, {
          reason: reason.trim(),
        });
      } else {
        alert("Aksi request tidak dikenal");
        return;
      }

      setAction(null);
      setSelectedRequest(null);

      await loadRequests(currentPage);
    } catch (error) {
      console.error("Gagal memproses request:", error);
      console.error("Response:", error.response?.data);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Gagal memproses request";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const handleCreateRequest = async (data) => {
    try {
      setLoading(true);

      await createRequest(data);

      setShowForm(false);
      await loadRequests(currentPage);
    } catch (error) {
      console.error("Gagal membuat request:", error);
      console.error("Response:", error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));

    setCurrentPage(nextPage);
    await loadRequests(nextPage);
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
              <h1>Permintaan Stok</h1>
              <p>Kelola permintaan stok dari pengguna.</p>
            </div>

            <div className={styles.headerActions}>
              <Button
                type="button"
                variant="outline"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>

              <Button
                type="button"
                variant="primary"
                icon={Plus}
                onClick={() => setShowForm(true)}
                disabled={loading}
              >
                Buat Request
              </Button>
            </div>
          </div>

          {loading && requests.length === 0 ? (
            <Loading
              size="medium"
              text="Memuat request..."
            />
          ) : (
            <RequestTable
              requests={requests}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onView={handleView}
              onApprove={(request) =>
                handleAction("approve", request)
              }
              onReject={(request) =>
                handleAction("reject", request)
              }
            />
          )}

          <RequestDetail
            isOpen={Boolean(selectedRequest) && !action}
            onClose={() => setSelectedRequest(null)}
            request={selectedRequest}
            onApprove={() =>
              handleAction("approve", selectedRequest)
            }
            onReject={() =>
              handleAction("reject", selectedRequest)
            }
          />

          <RequestAction
            isOpen={Boolean(action)}
            onClose={() => {
              setAction(null);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            action={action}
            loading={loading}
            onConfirm={handleConfirm}
          />

          {showForm && (
            <RequestForm
              products={products}
              loading={productLoading || loading}
              onSubmit={handleCreateRequest}
              onCancel={() => setShowForm(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Request;