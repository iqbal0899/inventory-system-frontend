
import {
  Eye,
  PackageCheck,
  XCircle,
  LoaderCircle,
} from "lucide-react";

import Button from "../common/button";
import Table from "../common/table";
import Pagination from "../common/pagination";

import styles from "../../css/purchaseTable.module.css";

function PurchaseTable({
  purchases = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  processingId = null,
  onPageChange,
  onView,
  onReceive,
  onCancel,
  canManagePurchases = false,
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
            (purchase.id
              ? `PO-${String(purchase.id).padStart(6, "0")}`
              : "-")}
        </strong>
      ),
    },

     
{
  key: "products",
  label: "Produk",
  render: (purchase) => {
    const items = purchase.items || purchase.purchaseItems || [];

    if (items.length === 0) {
      return <span>-</span>;
    }

    return (
      <div className={styles.products}>
        {items.map((item, index) => {
          const product = item.product || {};

          return (
            <div
              key={item.id || item.productId || index}
              className={styles.product}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name || "Produk"}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>P</div>
              )}

              <div>
                <strong>
                  {product.name ||
                    item.productName ||
                    item.name ||
                    "Nama produk tidak tersedia"}
                </strong>

                <span>
                  {product.code || "-"} · {item.quantity || 0}{" "}
                  {product.unit || "unit"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
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
        const isProcessing =
          String(processingId) === String(purchase.id);

        return (
          <div className={styles.actions}>
            <Button
              type="button"
              variant="ghost"
              size="small"
              icon={Eye}
              onClick={() => onView?.(purchase)}
              disabled={isProcessing}
              aria-label="Lihat pembelian"
            />

            {canManagePurchases && purchase.status === "PENDING" && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  icon={isProcessing ? LoaderCircle : PackageCheck}
                  onClick={() => onReceive?.(purchase)}
                  disabled={isProcessing || processingId !== null}
                  aria-label="Terima barang"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  icon={isProcessing ? LoaderCircle : XCircle}
                  onClick={() => onCancel?.(purchase)}
                  disabled={isProcessing || processingId !== null}
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
