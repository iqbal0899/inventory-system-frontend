import { Eye, PackageCheck, XCircle } from "lucide-react";

import Button from "../common/button";
import Table from "../common/table";
import Pagination from "../common/pagination";

import styles from "../../css/purchaseTable.module.css";

function PurchaseTable({
  purchases = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onView,
  onReceive,
  onCancel,
}) {
  const formatCurrency = (amount) =>
    `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    const statuses = {
      PENDING: {
        label: "Menunggu",
        className: styles.pending,
      },
      RECEIVED: {
        label: "Diterima",
        className: styles.received,
      },
      COMPLETED: {
        label: "Selesai",
        className: styles.received,
      },
      CANCELLED: {
        label: "Dibatalkan",
        className: styles.cancelled,
      },
    };

    return (
      statuses[normalizedStatus] || {
        label: status || "Tidak diketahui",
        className: styles.unknown,
      }
    );
  };

  const columns = [
    {
      key: "code",
      label: "Kode Pembelian",
      render: (purchase) => (
        <strong className={styles.code}>
          {purchase.code ||
            purchase.purchaseNumber ||
            (purchase.id ? `PO-${String(purchase.id).padStart(6, "0")}` : "-")}
        </strong>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (purchase) => (
        <div className={styles.supplier}>
          <strong>
            {purchase.supplier?.name ||
              purchase.supplierName ||
              "-"}
          </strong>

          {purchase.supplier?.code && (
            <span>{purchase.supplier.code}</span>
          )}
        </div>
      ),
    },
    {
      key: "purchaseDate",
      label: "Tanggal Pembelian",
      render: (purchase) =>
        formatDate(purchase.purchaseDate || purchase.createdAt),
    },
    {
      key: "items",
      label: "Jumlah Item",
      align: "center",
      render: (purchase) => {
        const items = purchase.items || purchase.purchaseItems || [];

        const totalQuantity = items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );

        return (
          <div className={styles.itemCount}>
            <strong>{items.length}</strong>
            <span>{totalQuantity} unit</span>
          </div>
        );
      },
    },
    {
      key: "total",
      label: "Total Pembelian",
      align: "right",
      render: (purchase) => {
        const items = purchase.items || purchase.purchaseItems || [];

        const calculatedTotal = items.reduce(
          (total, item) =>
            total +
            Number(item.quantity || 0) *
              Number(
                item.unitPrice ??
                  item.purchasePrice ??
                  item.price ??
                  0
              ),
          0
        );

        const total =
          purchase.totalAmount ??
          purchase.totalPrice ??
          purchase.total ??
          calculatedTotal;

        return (
          <strong className={styles.total}>
            {formatCurrency(total)}
          </strong>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (purchase) => {
        const status = getStatus(purchase.status);

        return (
          <span
            className={`${styles.status} ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Aksi",
      align: "center",
      render: (purchase) => {
        const status = String(purchase.status || "").toUpperCase();
        const isPending = status === "PENDING";

        return (
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="small"
              icon={Eye}
              onClick={() => onView?.(purchase)}
              aria-label="Lihat pembelian"
            />

            {isPending && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  icon={PackageCheck}
                  onClick={() => onReceive?.(purchase)}
                  aria-label="Terima barang"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  icon={XCircle}
                  onClick={() => onCancel?.(purchase)}
                  aria-label="Batalkan pembelian"
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Table
        columns={columns}
        data={purchases}
        loading={loading}
        emptyMessage="Belum ada data pembelian."
        rowKey="id"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default PurchaseTable;
