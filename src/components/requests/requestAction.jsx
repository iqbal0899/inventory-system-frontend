import { useEffect, useState } from "react";
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
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isApprove = action === "approve";

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen, action, request?.id]);

  if (!request) {
    return null;
  }

  const items = request.items || request.requestItems || [];

  const totalQuantity =
    items.length > 0
      ? items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        )
      : Number(request.quantity || 0);

  const productNames =
    items.length > 0
      ? items
          .map(
            (item) =>
              item.product?.name || item.productName || "-"
          )
          .join(", ")
      : request.product?.name || request.product || "-";

  const handleConfirm = () => {
    if (loading) {
      return;
    }

    if (!isApprove && !reason.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    setError("");
    onConfirm?.(isApprove ? undefined : reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApprove ? "Setujui Request" : "Tolak Request"}
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
            {isApprove ? <Check size={24} /> : <X size={24} />}
          </div>

          <h3>
            {isApprove
              ? "Setujui permintaan ini?"
              : "Tolak permintaan ini?"}
          </h3>

          <p>
            Request{" "}
            <strong>
              {request.requestNumber || request.id}
            </strong>{" "}
            untuk produk <strong>{productNames}</strong>{" "}
            sebanyak <strong>{totalQuantity} unit</strong>.
          </p>

          {items.length > 1 && (
            <div className={styles.items}>
              {items.map((item, index) => (
                <div
                  className={styles.item}
                  key={item.id || `${item.productId}-${index}`}
                >
                  <span>
                    {item.product?.name ||
                      item.productName ||
                      "-"}
                  </span>

                  <strong>
                    {item.quantity ?? 0}{" "}
                    {item.product?.unit || "pcs"}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {!isApprove && (
            <div className={styles.reasonField}>
              <label
                className={styles.reasonLabel}
                htmlFor="rejection-reason"
              >
                Alasan Penolakan
                <span className={styles.required}>*</span>
              </label>

              <textarea
                id="rejection-reason"
                className={styles.reasonInput}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);

                  if (event.target.value.trim()) {
                    setError("");
                  }
                }}
                placeholder="Masukkan alasan penolakan request..."
                rows={4}
                maxLength={500}
                required
              />

              {error && (
                <p className={styles.reasonError}>
                  {error}
                </p>
              )}

              <span className={styles.reasonHint}>
                {reason.length}/500 karakter
              </span>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant={isApprove ? "success" : "danger"}
              loading={loading}
              onClick={handleConfirm}
            >
              {isApprove ? "Setujui" : "Tolak"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default RequestAction;
