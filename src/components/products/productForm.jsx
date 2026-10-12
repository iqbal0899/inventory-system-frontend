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

// =========================
// KATEGORI PRODUK
// =========================

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
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] =
    useState(initialForm);

  const [suppliers, setSuppliers] =
    useState([]);

  const [supplierLoading, setSupplierLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState("");

  // =========================
  // LOAD SUPPLIERS
  // =========================

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setSupplierLoading(true);

        const response =
          await getSuppliers();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal mengambil data supplier"
          );
        }

        setSuppliers(
          response.data || []
        );
      } catch (error) {
        console.error(
          "GET SUPPLIERS ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Gagal mengambil data supplier"
        );
      } finally {
        setSupplierLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // =========================
  // INITIAL DATA
  // =========================

  

useEffect(() => {
  if (!initialData) {
    setFormData({ ...initialForm });
    setImagePreview("");
    return;
  }

  console.log("INITIAL DATA:", initialData);
  console.log("CATEGORY DARI BACKEND:", initialData.category);

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



  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    // =========================
    // IMAGE
    // =========================

    if (name === "image") {
      const file =
        files?.[0] || null;

      setFormData((previous) => ({
        ...previous,
        image: file,
      }));

      if (file) {
        const previewUrl =
          URL.createObjectURL(file);

        setImagePreview(
          previewUrl
        );
      } else {
        setImagePreview("");
      }

      setError("");

      return;
    }

    // =========================
    // INPUT
    // =========================

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (event) => {
    event.preventDefault();

    // =========================
    // VALIDASI
    // =========================

    if (!formData.name.trim()) {
      setError(
        "Nama produk wajib diisi."
      );
      return;
    }

    if (!formData.category) {
      setError(
        "Kategori produk wajib dipilih."
      );
      return;
    }

    if (!formData.price) {
      setError(
        "Harga produk wajib diisi."
      );
      return;
    }

    if (
      Number(formData.price) < 0
    ) {
      setError(
        "Harga tidak boleh negatif."
      );
      return;
    }

    if (
      Number(formData.stock) < 0
    ) {
      setError(
        "Stok tidak boleh negatif."
      );
      return;
    }

    if (
      Number(formData.minStock) < 0
    ) {
      setError(
        "Minimum stok tidak boleh negatif."
      );
      return;
    }

    // =========================
    // DATA
    // =========================

    const productData = {
  name: formData.name.trim(),
  description: formData.description.trim(),
  category: formData.category,
  supplierId: formData.supplierId
    ? Number(formData.supplierId)
    : null,
  price: Number(formData.price),
  stock: Number(formData.stock || 0),
  minStock: Number(formData.minStock || 0),
  unit: formData.unit || "pcs",
  status: formData.status,
  image: formData.image,
};

    console.log(
      "PRODUCT DATA:",
      productData
    );

    // =========================
    // SUBMIT
    // =========================

    if (
      typeof onSubmit === "function"
    ) {
      onSubmit(productData);
    } else {
      console.error(
        "onSubmit tidak tersedia"
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Loading
        size="medium"
        text="Memproses produk..."
      />
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div
          className={styles.error}
        >
          {error}
        </div>
      )}

      <div
        className={styles.formGrid}
      >
        {/* =========================
            KODE
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="code">
            Kode Produk
          </label>

          <input
            id="code"
            name="code"
            value={
              formData.code ||
              "PRD-XXXXXX"
            }
            readOnly
            disabled
          />

          <small>
            Kode produk dibuat
            otomatis oleh sistem.
          </small>
        </div>

        {/* =========================
            NAMA
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="name">
            Nama Produk
          </label>

          <input
            id="name"
            name="name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            placeholder="Masukkan nama produk"
          />
        </div>

        {/* =========================
            DESKRIPSI
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="description">
            Deskripsi
          </label>

          <textarea
            id="description"
            name="description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            placeholder="Masukkan deskripsi produk"
            rows="3"
          />
        </div>

        {/* =========================
            KATEGORI
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="category">
            Kategori
          </label>

          <select
            id="category"
            name="category"
            value={
              formData.category
            }
            onChange={
              handleChange
            }
          >
            <option value="">
              Pilih kategori
            </option>

            {productCategories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <small>
            Kategori produk
            ditentukan dari
            pilihan sistem.
          </small>
        </div>

        {/* =========================
            SUPPLIER
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="supplierId">
            Supplier
          </label>

          <select
            id="supplierId"
            name="supplierId"
            value={
              formData.supplierId
            }
            onChange={
              handleChange
            }
            disabled={
              supplierLoading
            }
          >
            <option value="">
              {supplierLoading
                ? "Memuat supplier..."
                : "Pilih supplier"}
            </option>

            {suppliers.map(
              (supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.code
                    ? `${supplier.code} - ${supplier.name}`
                    : supplier.name}
                </option>
              )
            )}
          </select>

          {!supplierLoading &&
            suppliers.length === 0 && (
              <small>
                Belum ada supplier.
                Tambahkan supplier
                terlebih dahulu.
              </small>
            )}
        </div>

        {/* =========================
            HARGA
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="price">
            Harga
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            value={
              formData.price
            }
            onChange={
              handleChange
            }
            placeholder="Masukkan harga"
          />
        </div>

        {/* =========================
            STOK
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="stock">
            Stok
          </label>

          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={
              formData.stock
            }
            onChange={
              handleChange
            }
            placeholder="Masukkan stok"
          />
        </div>

        {/* =========================
            MINIMUM STOK
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="minStock">
            Minimum Stok
          </label>

          <input
            id="minStock"
            name="minStock"
            type="number"
            min="0"
            value={
              formData.minStock
            }
            onChange={
              handleChange
            }
            placeholder="Contoh: 10"
          />
        </div>

        {/* =========================
            UNIT
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="unit">
            Satuan
          </label>

          <select
            id="unit"
            name="unit"
            value={
              formData.unit
            }
            onChange={
              handleChange
            }
          >
            <option value="pcs">
              Pcs
            </option>

            <option value="box">
              Box
            </option>

            <option value="pack">
              Pack
            </option>

            <option value="kg">
              Kg
            </option>

            <option value="gram">
              Gram
            </option>

            <option value="liter">
              Liter
            </option>

            <option value="botol">
              Botol
            </option>

            <option value="dus">
              Dus
            </option>
          </select>
        </div>

        {/* =========================
            GAMBAR
        ========================== */}

        <div
          className={
            styles.formGroup
          }
        >
          <label htmlFor="image">
            Gambar Produk
          </label>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={
              handleChange
            }
          />

          <small>
            Format: JPG, JPEG,
            PNG, atau WebP.
          </small>

          {imagePreview && (
            <div
              className={
                styles.imagePreview
              }
            >
              <img
                src={imagePreview}
                alt="Preview produk"
              />
            </div>
          )}
        </div>
      </div>

      {/* =========================
          STATUS
      ========================== */}

      <label
        className={
          styles.checkbox
        }
      >
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

        <span>
          Produk aktif
        </span>
      </label>

      {/* =========================
          ACTION
      ========================== */}

      <div
        className={
          styles.actions
        }
      >
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
  initialData:
    PropTypes.object,

  loading:
    PropTypes.bool,

  onSubmit:
    PropTypes.func,

  onCancel:
    PropTypes.func,
};

export default ProductForm;

