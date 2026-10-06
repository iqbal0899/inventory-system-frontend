import { Check, X } from "lucide-react";

import Button from "../common/button";
import Modal from "../common/modal";
import Loading from "../common/loading";

import styles from "../../css/requestAction.module.css";

function RequestAction({
  isOpen,
  onClose,
  request,
  action,
  loading = false,
  onConfirm,
}) {
  if (!request) {
    return null;
  }

  const isApprove = action === "approve";

  const items =
    request.items ||
    request.requestItems ||
    [];

  const totalQuantity =
    items.length > 0
      ? items.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0
        )
      : Number(request.quantity || 0);

  const productNames =
    items.length > 0
      ? items
          .map(
            (item) =>
              item.product?.name ||
              item.productName ||
              "-"
          )
          .join(", ")
      : request.product?.name ||
        request.product ||
        "-";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isApprove
          ? "Setujui Request"
          : "Tolak Request"
      }
      size="small"
    >
      {loading ? (
        <Loading
          size="medium"
          text="Memproses request..."
        />
      ) : (
        <div className={styles.content}>
          <div className={styles.icon}>
            {isApprove ? (
              <Check size={24} />
            ) : (
              <X size={24} />
            )}
          </div>

          <h3>
            {isApprove
              ? "Setujui permintaan ini?"
              : "Tolak permintaan ini?"}
          </h3>

          <p>
            Request{" "}
            <strong>{request.id}</strong>{" "}
            untuk produk{" "}
            <strong>{productNames}</strong>{" "}
            sebanyak{" "}
            <strong>
              {totalQuantity} unit
            </strong>
            .
          </p>

          {items.length > 1 && (
            <div className={styles.items}>
              {items.map((item, index) => (
                <div
                  className={styles.item}
                  key={
                    item.id ||
                    `${item.productId}-${index}`
                  }
                >
                  <span>
                    {item.product?.name ||
                      item.productName ||
                      "-"}
                  </span>

                  <strong>
                    {item.quantity ?? 0}{" "}
                    {item.product?.unit ||
                      "pcs"}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant={
                isApprove
                  ? "success"
                  : "danger"
              }
              loading={loading}
              onClick={() =>
                onConfirm?.(request)
              }
            >
              {isApprove
                ? "Setujui"
                : "Tolak"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default RequestAction;