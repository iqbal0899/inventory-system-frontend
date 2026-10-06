import { Eye } from "lucide-react";

import Button from "../common/button";
import Table from "../common/table";
import Pagination from "../common/pagination";

import styles from "../../css/requestTable.module.css";

function RequestTable({
  requests = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onView,
}) {
  const statusLabel = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
    completed: "Selesai",
  };

  const getRequestItems = (request) => {
    return (
      request.items ||
      request.requestItems ||
      []
    );
  };

  const getProducts = (request) => {
    const items = getRequestItems(request);

    if (items.length > 0) {
      return items
        .map(
          (item) =>
            item.product?.name ||
            item.productName ||
            "-"
        )
        .join(", ");
    }

    return (
      request.product?.name ||
      request.product ||
      "-"
    );
  };

  const getTotalQuantity = (request) => {
    const items = getRequestItems(request);

    if (items.length > 0) {
      return items.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      );
    }

    return Number(request.quantity || 0);
  };

  const getRequester = (request) => {
    return (
      request.requester?.username ||
      request.user?.username ||
      request.requester ||
      request.user ||
      "-"
    );
  };

  const getDate = (request) => {
    const date =
      request.date ||
      request.createdAt ||
      request.requestedAt;

    return date
      ? new Date(date).toLocaleDateString("id-ID")
      : "-";
  };

  const columns = [
    {
      key: "id",
      label: "ID Request",
      render: (request) => (
        <strong>
          {request.id || "-"}
        </strong>
      ),
    },
    {
      key: "product",
      label: "Produk",
      render: (request) =>
        getProducts(request),
    },
    {
      key: "quantity",
      label: "Jumlah",
      align: "center",
      render: (request) =>
        `${getTotalQuantity(request)} unit`,
    },
    {
      key: "requester",
      label: "Requester",
      render: (request) =>
        getRequester(request),
    },
    {
      key: "date",
      label: "Tanggal",
      render: (request) =>
        getDate(request),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (request) => (
        <span
          className={`${styles.status} ${
            styles[request.status] || ""
          }`}
        >
          {statusLabel[request.status] ||
            request.status ||
            "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      align: "center",
      render: (request) => (
        <Button
          type="button"
          variant="outline"
          size="small"
          icon={Eye}
          onClick={() =>
            onView?.(request)
          }
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="Belum ada permintaan stok."
        rowKey="id"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default RequestTable;