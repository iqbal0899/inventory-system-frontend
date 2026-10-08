import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";

import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import Pagination from "../../components/common/pagination";
import Loading from "../../components/common/loading";

import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import UserTable from "../../components/users/userTable";
import UserForm from "../../components/users/userForm";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userApi";

import styles from "../../css/users.module.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getUsers({
        page: currentPage,
        limit: 10,
        search,
        role,
      });

      setUsers(response?.data || []);
      setTotalPages(
        response?.pagination?.totalPages || 1
      );
    } catch (error) {
      console.error("Gagal mengambil data user:", error);

      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, role]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleCreate() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function handleEdit(user) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (formLoading) return;

    setModalOpen(false);
    setSelectedUser(null);
  }

  async function handleSubmit(data) {
    try {
      setFormLoading(true);

      if (selectedUser) {
        await updateUser(selectedUser.id, data);
      } else {
        await createUser(data);
      }

      setModalOpen(false);
      setSelectedUser(null);

      await loadUsers();
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus user "${user.username}"?`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      await deleteUser(user.id);

      await loadUsers();
    } catch (error) {
      window.alert(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal menghapus user"
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();

    setCurrentPage(1);
  }

  function handleRoleChange(event) {
    setRole(event.target.value);
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  async function handleRefresh() {
    await loadUsers();
  }

  return (
    <div className={styles.page}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`${styles.main} ${
          collapsed ? styles.mainCollapsed : ""
        }`}
      >
        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className={styles.content}>
          <div className={styles.header}>
            <div>
              <h1>Pengguna</h1>

              <p>
                Kelola data pengguna dan hak akses sistem
                inventory.
              </p>
            </div>

            <div className={styles.headerActions}>
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw size={18} />
                Refresh
              </Button>

              <Button onClick={handleCreate}>
                <Plus size={18} />
                Tambah User
              </Button>
            </div>
          </div>

          <div className={styles.filterCard}>
            <form
              className={styles.searchForm}
              onSubmit={handleSearch}
            >
              <div className={styles.searchInput}>
                <Search size={18} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari username atau email..."
                />
              </div>

              <select
                value={role}
                onChange={handleRoleChange}
                className={styles.roleFilter}
              >
                <option value="">
                  Semua Role
                </option>

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

              <Button type="submit">
                Cari
              </Button>
            </form>
          </div>

          <div className={styles.card}>
            {deleteLoading && (
              <div className={styles.deleteLoading}>
                Menghapus user...
              </div>
            )}

            <UserTable
              users={users}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          selectedUser
            ? "Edit User"
            : "Tambah User"
        }
      >
        <UserForm
          user={selectedUser}
          loading={formLoading}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default Users;