
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Button from "../common/button";
import Loading from "../common/loading";
import { getSuppliers } from "../../services/supplierApi";
import styles from "../../css/productForm.module.css";

const initialForm = {
  code: "",
  name: "",
  description: "",
  category: "",
  supplierId: "",
  price: "",
  stock: "",
  minStock: "",
  unit: "pcs",
  image: null,
  status: "ACTIVE",
};

const productCategories = [
  "Makanan",
  "Minuman",
  "Elektronik",
  "ATK",
  "Kebutuhan Rumah Tangga",
  "Perawatan",
  "Lainnya",
];

function ProductForm({
  initialData = null,
  loading = false,
  disableStock = false,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({ ...initialForm });
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    let active = true;

    const loadSuppliers = async () => {
      try {
        setSupplierLoading(true);

        const response = await getSuppliers();

        if (!response?.success) {
          throw new Error(
            response?.message || "Gagal mengambil data supplier"
          );
        }

        if (active) {
          setSuppliers(response.data || []);
        }
      } catch (error) {
        console.error("GET SUPPLIERS ERROR:", error);

        if (active) {
          setError(
            error?.response?.data?.message ||
              error?.message ||
              "Gagal mengambil data supplier"
          );
        }
      } finally {
        if (active) {
          setSupplierLoading(false);
        }
      }
    };

    loadSuppliers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialData) {
      setFormData({ ...initialForm });
      setImagePreview("");
      return;
    }

    const savedCategory = String(
      initialData.category ?? ""
    ).trim();

    const matchedCategory = productCategories.find(
      (category) =>
        category.toLowerCase() === savedCategory.toLowerCase()
    );

    setFormData({
      code: initialData.code || "",
      name: initialData.name || "",
      description: initialData.description || "",
      category: matchedCategory || savedCategory,
      supplierId: String(
        initialData.supplierId ??
          initialData.supplier?.id ??
          ""
      ),
      price: initialData.price ?? "",
      stock: initialData.stock ?? "",
      minStock: initialData.minStock ?? "",
      unit: initialData.unit || "pcs",
      image: null,
      status: initialData.status || "ACTIVE",
    });

    setImagePreview(initialData.image || "");
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (name === "image") {
      const file = files?.[0] || null;

      setFormData((previous) => ({
        ...previous,
        image: file,
      }));

      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(initialData?.image || "");
      }

      setError("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };


const handleSubmit = async (event) => {
  event.preventDefault();

  if (!formData.name.trim()) {
    setError("Nama produk wajib diisi.");
    return;
  }

  if (!formData.category) {
    setError("Kategori produk wajib dipilih.");
    return;
  }

  if (
    formData.price === "" ||
    !Number.isFinite(Number(formData.price)) ||
    Number(formData.price) < 0
  ) {
    setError("Harga produk tidak valid.");
    return;
  }

  if (
    !Number.isFinite(Number(formData.minStock || 0)) ||
    Number(formData.minStock || 0) < 0
  ) {
    setError("Minimum stok tidak valid.");
    return;
  }

  if (typeof onSubmit !== "function") {
    setError("Fungsi submit produk tidak tersedia.");
    return;
  }

  const productData = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    category: formData.category,
    supplierId: formData.supplierId || "",
    price: Number(formData.price),
    minStock: Number(formData.minStock || 0),
    unit: formData.unit || "pcs",
    status: formData.status,
    image: formData.image,
  };

  try {
    setError("");
    await onSubmit(productData);
  } catch (error) {
    console.error("SUBMIT PRODUCT ERROR:", error);

    setError(
      error?.response?.data?.message ||
        error?.message ||
        "Gagal menyimpan produk."
    );
  }
};


  if (loading) {
    return (
      <Loading
        size="medium"
        text="Memproses produk..."
      />
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="code">Kode Produk</label>
          <input
            id="code"
            name="code"
            value={formData.code || "PRD-XXXXXX"}
            readOnly
            disabled
          />
          <small>Kode produk dibuat otomatis oleh sistem.</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Nama Produk</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama produk"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Deskripsi</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Masukkan deskripsi produk"
            rows="3"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Kategori</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Pilih kategori</option>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="supplierId">Supplier</label>
          <select
            id="supplierId"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            disabled={supplierLoading}
          >
            <option value="">
              {supplierLoading
                ? "Memuat supplier..."
                : "Pilih supplier"}
            </option>

            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.code
                  ? `${supplier.code} - ${supplier.name}`
                  : supplier.name}
              </option>
            ))}
          </select>

          {!supplierLoading && suppliers.length === 0 && (
            <small>Belum ada supplier.</small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price">Harga</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="Masukkan harga"
            required
          />
        </div>

        <div className={styles.formGroup}>
  <label htmlFor="stock">Stok</label>
  <input
    id="stock"
    name="stock"
    type="number"
    value={formData.stock ?? 0}
    disabled
    readOnly
  />
  <small>
    Stok hanya dapat ditambahkan melalui menu Pembelian.
  </small>
</div>

        <div className={styles.formGroup}>
          <label htmlFor="minStock">Minimum Stok</label>
          <input
            id="minStock"
            name="minStock"
            type="number"
            min="0"
            value={formData.minStock}
            onChange={handleChange}
            placeholder="Contoh: 10"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="unit">Satuan</label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
          >
            <option value="pcs">Pcs</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
            <option value="kg">Kg</option>
            <option value="gram">Gram</option>
            <option value="liter">Liter</option>
            <option value="botol">Botol</option>
            <option value="dus">Dus</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">Gambar Produk</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleChange}
          />
          <small>Format JPG, JPEG, PNG, atau WebP. Maksimal 2 MB.</small>

          {imagePreview && (
            <div className={styles.imagePreview}>
              <img
                src={
                  imagePreview.startsWith("blob:")
                    ? imagePreview
                    : imagePreview.startsWith("http")
                      ? imagePreview
                      : `${import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, "") || ""}${imagePreview}`
                }
                alt="Preview produk"
              />
            </div>
          )}
        </div>
      </div>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="status"
          checked={formData.status === "ACTIVE"}
          onChange={(event) => {
            setFormData((previous) => ({
              ...previous,
              status: event.target.checked
                ? "ACTIVE"
                : "INACTIVE",
            }));
            setError("");
          }}
        />
        <span>Produk aktif</span>
      </label>

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Batal
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {initialData
            ? "Simpan Perubahan"
            : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
}

ProductForm.propTypes = {
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  disableStock: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default ProductForm;
