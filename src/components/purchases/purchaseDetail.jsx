
import {
  X,
  Package,
  Truck,
  CalendarDays,
  ClipboardList,
  FileText,
} from "lucide-react";

import Button from "../common/button";
import styles from "../../css/purchaseDetail.module.css";

function PurchaseDetail({ purchase, onClose }) {
  if (!purchase) return null;

  const items = purchase.items || purchase.purchaseItems || [];

  const formatCurrency = (amount) =>
    `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const statusConfig = {
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

  const status =
    statusConfig[String(purchase.status || "").toUpperCase()] || {
      label: purchase.status || "Tidak diketahui",
      className: styles.unknown,
    };

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const calculatedTotal = items.reduce((total, item) => {
    const unitPrice = Number(
      item.unitPrice ??
        item.purchasePrice ??
        item.price ??
        item.product?.purchasePrice ??
        item.product?.price ??
        0
    );

    return total + Number(item.quantity || 0) * unitPrice;
  }, 0);

  const totalAmount =
    purchase.totalAmount ??
    purchase.totalPrice ??
    purchase.total ??
    calculatedTotal;

  const purchaseCode =
    purchase.code ||
    purchase.purchaseNumber ||
    (purchase.id
      ? `PO-${String(purchase.id).padStart(6, "0")}`
      : "-");

  const getUnitPrice = (item) =>
    Number(
      item.unitPrice ??
        item.purchasePrice ??
        item.price ??
        item.product?.purchasePrice ??
        item.product?.price ??
        0
    );

  const getProductName = (item) =>
    item.product?.name ||
    item.productName ||
    item.name ||
    "Nama produk tidak tersedia";

  const getProductCode = (item) =>
    item.product?.code || item.productCode || "-";

  const getUnit = (item) => item.product?.unit || item.unit || "unit";

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-detail-title"
      >
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerIcon}>
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 id="purchase-detail-title">Detail Pembelian</h2>
              <p>{purchaseCode}</p>
            </div>
          </div>

          <Button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Tutup detail pembelian"
          >
            <X size={20} />
          </Button>
        </header>

        <div className={styles.content}>
          <div className={styles.statusRow}>
            <span className={styles.sectionLabel}>
              Status Pembelian
            </span>

            <span className={`${styles.status} ${status.className}`}>
              {status.label}
            </span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <ClipboardList size={19} />
              </div>

              <div>
                <span>Kode Pembelian</span>
                <strong>{purchaseCode}</strong>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <CalendarDays size={19} />
              </div>

              <div>
                <span>Tanggal Pembelian</span>
                <strong>
                  {formatDate(purchase.purchaseDate || purchase.createdAt)}
                </strong>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Truck size={19} />
              </div>

              <div>
                <span>Supplier</span>
                <strong>
                  {purchase.supplier?.name ||
                    purchase.supplierName ||
                    "-"}
                </strong>

                {purchase.supplier?.code && (
                  <small>{purchase.supplier.code}</small>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Package size={19} />
              </div>

              <div>
                <span>Total Barang</span>
                <strong>{totalQuantity} unit</strong>
                <small>{items.length} jenis produk</small>
              </div>
            </div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3>Daftar Produk</h3>
                <p>Rincian produk dalam pembelian ini</p>
              </div>

              <span className={styles.itemBadge}>
                {items.length} produk
              </span>
            </div>

            {items.length === 0 ? (
              <div className={styles.empty}>
                Belum ada rincian produk pada pembelian ini.
              </div>
            ) : (
              <div className={styles.productList}>
                {items.map((item, index) => {
                  const quantity = Number(item.quantity || 0);
                  const unitPrice = getUnitPrice(item);
                  const subtotal = quantity * unitPrice;

                  return (
                    <div
                      key={item.id || item.productId || index}
                      className={styles.productRow}
                    >
                      <div className={styles.productInfo}>
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={getProductName(item)}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <Package size={22} />
                          </div>
                        )}

                        <div className={styles.productText}>
                          <strong>{getProductName(item)}</strong>
                          <span>{getProductCode(item)}</span>
                          <small>
                            {formatCurrency(unitPrice)} / {getUnit(item)}
                          </small>
                        </div>
                      </div>

                      <div className={styles.quantity}>
                        <span>Jumlah</span>
                        <strong>
                          {quantity} {getUnit(item)}
                        </strong>
                      </div>

                      <div className={styles.subtotal}>
                        <span>Subtotal</span>
                        <strong>{formatCurrency(subtotal)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>Jumlah jenis produk</span>
              <strong>{items.length} produk</strong>
            </div>

            <div className={styles.totalRow}>
              <span>Total kuantitas</span>
              <strong>{totalQuantity} unit</strong>
            </div>

            <div className={styles.grandTotal}>
              <span>Total Pembelian</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </section>

          {purchase.note && (
            <section className={styles.noteSection}>
              <div className={styles.noteTitle}>
                <FileText size={18} />
                <strong>Catatan Pembelian</strong>
              </div>

              <p>{purchase.note}</p>
            </section>
          )}

          {purchase.receivedAt && (
            <div className={styles.dateInfo}>
              <Package size={16} />
              <span>
                Barang diterima pada {formatDate(purchase.receivedAt)}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PurchaseDetail;
