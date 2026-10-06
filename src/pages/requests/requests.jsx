import { useEffect, useState } from "react";
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

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [action, setAction] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = async () => {
    try {
      setProductLoading(true);

      const response = await getProducts({
        page: 1,
        limit: 100,
      });

      const data =
        response?.data?.products ||
        response?.data ||
        response?.products ||
        [];

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Gagal mengambil data produk:",
        error
      );

      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  };

  const loadRequests = async (page = currentPage) => {
    try {
      setLoading(true);

      const response = await getRequests({
        page,
        limit: 10,
      });

      const data = response?.data;

      if (Array.isArray(data)) {
        setRequests(data);
        setTotalPages(1);
        return;
      }

      setRequests(data?.requests || []);

      setTotalPages(
        data?.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error(
        "Gagal mengambil data request:",
        error
      );

      setRequests([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadProducts(),
      loadRequests(currentPage),
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleView = (request) => {
    setSelectedRequest(request);
  };

  const handleAction = (type) => {
    setAction(type);
  };

  const handleConfirm = async (request) => {
    try {
      setLoading(true);

      if (action === "approve") {
        await approveRequest(request.id);
      }

      if (action === "reject") {
        await rejectRequest(request.id);
      }

      setAction(null);
      setSelectedRequest(null);

      await loadRequests(currentPage);
      await loadProducts();
    } catch (error) {
      console.error(
        "Gagal memproses request:",
        error
      );
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
      console.error(
        "Gagal membuat request:",
        error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    await loadRequests(page);
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

              <p>
                Kelola permintaan stok dari pengguna.
              </p>
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
              >
                Buat Request
              </Button>
            </div>
          </div>

          {loading ? (
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
            />
          )}

          <RequestDetail
            isOpen={
              Boolean(selectedRequest) && !action
            }
            onClose={() =>
              setSelectedRequest(null)
            }
            request={selectedRequest}
            onApprove={() =>
              handleAction("approve")
            }
            onReject={() =>
              handleAction("reject")
            }
          />

          <RequestAction
            isOpen={Boolean(action)}
            onClose={() => setAction(null)}
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