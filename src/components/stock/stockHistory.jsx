import { useCallback, useEffect, useState } from "react";

import Table from "../common/table";
import Pagination from "../common/pagination";

import { getStockMovements } from "../../services/stockApi";

import styles from "../../css/stockMovmentTable.module.css";

function StockHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStockMovements({
          page: currentPage,
          limit: 10,
        });

      setMovements(
        response?.data || []
      );

      setTotalPages(
        response?.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error(
        "Gagal mengambil riwayat stok:",
        error
      );

      setMovements([]);
      setTotalPages(1);

      setError(
        error?.response?.data?.message ||
          "Gagal mengambil riwayat stok."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const movementLabels = {
    INITIAL: "Stok Awal",
    IN: "Stok Masuk",
    OUT: "Stok Keluar",
    ADJUSTMENT: "Penyesuaian",
  };

  const columns = [
    {
      key: "createdAt",
      label: "Tanggal",
      render: (movement) =>
        movement.createdAt
          ? new Date(
              movement.createdAt
            ).toLocaleString("id-ID")
          : "-",
    },
    {
      key: "product",
      label: "Produk",
      render: (movement) =>
        movement.product?.name || "-",
    },
    {
      key: "type",
      label: "Jenis",
      align: "center",
      render: (movement) => (
        <span
          className={`${styles.type} ${
            styles[
              movement.type?.toLowerCase()
            ] || ""
          }`}
        >
          {movementLabels[
            movement.type
          ] ||
            movement.type ||
            "-"}
        </span>
      ),
    },
    {
      key: "stockBefore",
      label: "Sebelum",
      align: "center",
      render: (movement) =>
        movement.stockBefore ?? "-",
    },
    {
      key: "quantity",
      label: "Perubahan",
      align: "center",
      render: (movement) => {
        const quantity = Number(
          movement.quantity ?? 0
        );

        const isDecrease =
          movement.type === "OUT" ||
          (movement.type === "ADJUSTMENT" &&
            quantity < 0);

        if (quantity === 0) {
          return "0";
        }

        return (
          <span
            className={
              isDecrease
                ? styles.decrease
                : styles.increase
            }
          >
            {isDecrease ? "-" : "+"}
            {Math.abs(quantity)}
          </span>
        );
      },
    },
    {
      key: "stockAfter",
      label: "Sesudah",
      align: "center",
      render: (movement) =>
        movement.stockAfter ?? "-",
    },
    {
      key: "user",
      label: "Oleh",
      render: (movement) =>
        movement.user?.username || "-",
    },
    {
      key: "request",
      label: "Kode Request",
      render: (movement) =>
        movement.request?.requestNumber ||
        "-",
    },
    {
      key: "note",
      label: "Keterangan",
      render: (movement) =>
        movement.note || "-",
    },
  ];

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={movements}
        loading={loading}
        emptyMessage="Belum ada riwayat pergerakan stok."
        rowKey="id"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default StockHistory;