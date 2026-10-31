import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
} from "lucide-react";

import Button from "../../components/common/button";
import Pagination from "../../components/common/pagination";
import Loading from "../../components/common/loading";

import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import SupplierTable from "../../components/suppliers/supplierTable";
import SupplierModal from "../../components/suppliers/SupplierModal";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/supplierApi";

import styles from "../../css/suppliers.module.css";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState("");

  const [selectedSupplier, setSelectedSupplier] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("detail");

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = 1;

  // =========================
  // LOAD SUPPLIERS
  // =========================

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const response = await getSuppliers();

      if (response?.success) {
        setSuppliers(response.data || []);
      }
    } catch (error) {
      console.error(
        "GET SUPPLIERS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAdd = () => {
    setSelectedSupplier(null);
    setModalMode("add");
    setModalOpen(true);
  };

  // =========================
  // VIEW
  // =========================

  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("detail");
    setModalOpen(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("edit");
    setModalOpen(true);
  };

  // =========================
  // SAVE
  // =========================

  const handleSubmit = async (data) => {
    try {
      setSaving(true);

      let response;

      if (
        modalMode === "edit" &&
        selectedSupplier
      ) {
        response = await updateSupplier(
          selectedSupplier.id,
          data
        );
      } else {
        response = await createSupplier(data);
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Gagal menyimpan supplier"
        );
      }

      setModalOpen(false);
      setSelectedSupplier(null);

      await loadSuppliers();
    } catch (error) {
      console.error(
        "SAVE SUPPLIER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal menyimpan supplier"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Hapus supplier "${supplier.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSupplier(supplier.id);

      await loadSuppliers();
    } catch (error) {
      console.error(
        "DELETE SUPPLIER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Gagal menghapus supplier"
      );
    }
  };

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    loadSuppliers();
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className={styles.layout}>
      {/* NAVBAR */}
      <Navbar />

      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed} />

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        <main className={styles.page}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <h1>Supplier</h1>

              <p>
                Kelola data supplier inventory.
              </p>
            </div>

            <div
              className={styles.headerActions}
            >
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
                onClick={handleAdd}
              >
                Tambah Supplier
              </Button>
            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <Loading
              size="medium"
              text="Memuat supplier..."
            />
          ) : (
            <>
              <SupplierTable
                suppliers={suppliers}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          {/* SUPPLIER MODAL */}
          <SupplierModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            mode={modalMode}
            supplier={selectedSupplier}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </main>
      </div>
    </div>
  );
}

export default Suppliers;

