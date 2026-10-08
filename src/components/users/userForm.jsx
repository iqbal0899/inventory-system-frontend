import { useEffect, useState } from "react";

import Button from "../common/button";

import styles from "../../css/userForm.module.css";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "STAFF",
};

function UserForm({
  user = null,
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role || "STAFF",
      });
    } else {
      setFormData(initialForm);
    }

    setError("");
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.username.trim()) {
      setError("Username wajib diisi");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!isEdit && !formData.password) {
      setError("Password wajib diisi");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await onSubmit(payload);

      if (!isEdit) {
        setFormData(initialForm);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal menyimpan user"
      );
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
    >
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="username">
          Username
        </label>

        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Masukkan username"
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Masukkan email"
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">
          Password
          {isEdit && (
            <span> Kosongkan jika tidak diubah</span>
          )}
        </label>

        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={
            isEdit
              ? "Masukkan password baru"
              : "Masukkan password"
          }
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="role">
          Role
        </label>

        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="SUPER_ADMIN">
            Super Admin
          </option>

          <option value="ADMIN">
            Admin
          </option>

          <option value="STAFF">
            Staff
          </option>
        </select>
      </div>

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
          disabled={loading}
        >
          {loading
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Tambah User"}
        </Button>
      </div>
    </form>
  );
}

export default UserForm;