import Modal from "../common/modal";
import Button from "../common/button";

import styles from "../../css/requestDetail.module.css";

function RequestDetail({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) {
  if (!request) {
    return null;
  }

  const statusLabel = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
    completed: "Selesai",
  };

  const isPending = request.status === "pending";

  const items =
    request.items ||
    request.requestItems ||
    [];

  const requester =
    request.requester?.username ||
    request.user?.username ||
    request.requester ||
    request.user ||
    "-";

  const requestDate =
    request.date ||
    request.createdAt ||
    request.requestedAt;

  const note =
    request.note ||
    request.reason;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Permintaan Stok"
      size="medium"
    >
      <div className={styles.detail}>
        <div className={styles.item}>
          <span>ID Request</span>
          <strong>
            {request.id || "-"}
          </strong>
        </div>

        <div className={styles.item}>
          <span>Requester</span>
          <strong>
            {requester}
          </strong>
        </div>

        <div className={styles.item}>
          <span>Tanggal</span>
          <strong>
            {requestDate
              ? new Date(
                  requestDate
                ).toLocaleString("id-ID")
              : "-"}
          </strong>
        </div>

        <div className={styles.item}>
          <span>Status</span>
          <strong>
            {statusLabel[request.status] ||
              request.status ||
              "-"}
          </strong>
        </div>

        <div className={styles.products}>
          <div className={styles.productsHeader}>
            <span>Produk</span>
            <span>Jumlah</span>
          </div>

          {items.length > 0 ? (
            items.map((item, index) => {
              const product =
                item.product || {};

              return (
                <div
                  className={styles.product}
                  key={
                    item.id ||
                    `${item.productId}-${index}`
                  }
                >
                  <div>
                    <strong>
                      {product.name ||
                        item.productName ||
                        "Produk"}
                    </strong>

                    <span>
                      {product.code ||
                        item.productCode ||
                        "-"}
                    </span>
                  </div>

                  <strong>
                    {item.quantity ?? 0}{" "}
                    {product.unit || "pcs"}
                  </strong>
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>
              Tidak ada produk
            </div>
          )}
        </div>

        {note && (
          <div className={styles.item}>
            <span>Catatan</span>
            <p>{note}</p>
          </div>
        )}
      </div>

      {isPending && (
        <div className={styles.actions}>
          <Button
            type="button"
            variant="danger"
            onClick={() =>
              onReject?.(request)
            }
          >
            Tolak
          </Button>

          <Button
            type="button"
            variant="success"
            onClick={() =>
              onApprove?.(request)
            }
          >
            Setujui
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default RequestDetail;