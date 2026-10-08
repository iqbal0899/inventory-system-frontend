import { Edit, Trash2 } from "lucide-react";

import Button from "../common/button";
import Table from "../common/table";

function UserTable({
  users = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const roleLabel = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    STAFF: "Staff",
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      align: "center",
      render: (user) => user.id,
    },
    {
      key: "username",
      label: "Username",
      render: (user) => user.username || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (user) => user.email || "-",
    },
    {
      key: "role",
      label: "Role",
      render: (user) => roleLabel[user.role] || user.role || "-",
    },
    {
      key: "createdAt",
      label: "Dibuat",
      render: (user) =>
        user.createdAt
          ? new Date(user.createdAt).toLocaleString("id-ID")
          : "-",
    },
    {
      key: "actions",
      label: "Aksi",
      align: "center",
      render: (user) => (
        <div className="table-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEdit(user)}
          >
            <Edit size={16} />
          </Button>

          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(user)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      loading={loading}
      emptyMessage="Belum ada data user."
      rowKey="id"
    />
  );
}

export default UserTable;