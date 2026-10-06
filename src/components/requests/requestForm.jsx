import { useState } from "react";
import { Send } from "lucide-react";

import Button from "../common/button";
import RequestProductSelector from "./requestProductSelector";
import RequestItemTable from "./requestTable";
import RequestSummary from "./requestSummary";

import styles from "../../css/requestForm.module.css";

function RequestForm({
  products = [],
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleAddItem = (productId, quantity) => {
    const id = Number(productId);
    const qty = Number(quantity);

    if (!id || !qty || qty <= 0) {
      return;
    }

    setError("");

    const existingItem = items.find(
      (item) => item.productId === id
    );

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === id
            ? {
                ...item,
                quantity: item.quantity + qty,
              }
            : item
        )
      );

      return;
    }

    setItems([
      ...items,
      {
        productId: id,
        quantity: qty,
      },
    ]);
  };

  const handleRemoveItem = (productId) => {
    setItems(
      items.filter(
        (item) => item.productId !== Number(productId)
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (items.length === 0) {
      setError("Minimal satu produk harus ditambahkan");
      return;
    }

    try {
      await onSubmit({
        items,
        note: note.trim() || null,
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal mengajukan request"
      );
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <RequestProductSelector
        products={products}
        items={items}
        loading={loading}
        onAdd={handleAddItem}
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.note}>
        <label htmlFor="request-note">
          Catatan
        </label>

        <textarea
          id="request-note"
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Masukkan catatan request..."
          rows={4}
          disabled={loading}
        />
      </div>

      <RequestSummary items={items} />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>

        <Button
          type="submit"
          disabled={loading || items.length === 0}
        >
          <Send size={18} />
          {loading
            ? "Mengajukan..."
            : "Ajukan Request"}
        </Button>
      </div>
    </form>
  );
}

export default RequestForm;