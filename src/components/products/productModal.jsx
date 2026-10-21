
import Modal from "../common/modal";
import ProductForm from "./productForm";

function ProductModal({
  isOpen,
  onClose,
  product = null,
  loading = false,
  onSubmit,
}) {

  console.log("Product:", product);
console.log("Disable stock:", Boolean(product));
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Produk" : "Tambah Produk"}
      size="large"
    >
      <ProductForm
  key={product?.id ?? "new-product"}
  initialData={product}
  loading={loading}
  disableStock={Boolean(product)}
  onSubmit={onSubmit}
  onCancel={onClose}
/>
    </Modal>
  );
}

export default ProductModal;
