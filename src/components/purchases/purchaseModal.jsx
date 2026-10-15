import Modal from "../common/modal";
import PurchaseForm from "./purchaseForm";

function PurchaseModal({
  isOpen,
  onClose,
  purchase = null,
  loading = false,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        purchase
          ? "Edit Pembelian"
          : "Tambah Pembelian"
      }
      size="large"
    >
      <PurchaseForm
        initialData={purchase}
        loading={loading}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default PurchaseModal;
