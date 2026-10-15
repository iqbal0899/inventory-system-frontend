import { useState } from "react";
import {
  CalendarDays,
  Download,
  RefreshCw,
} from "lucide-react";

import axiosApi from "../../services/axiosApi";
import Button from "../../components/common/button";
import Loading from "../../components/common/loading";
import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";

import styles from "../../css/reports.module.css";

function Reports() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal mulai dan tanggal akhir.");
      return;
    }

    if (startDate > endDate) {
      alert("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setReportData([]);

    try {
      const response = await axiosApi.get("/stock/movements", {
        params: {
          page: 1,
          limit: 1000,
          type: "OUT",
          startDate,
          endDate,
        },
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil laporan.");
      }

      const movements = Array.isArray(result.data)
        ? result.data
        : [];

      setReportData(
        movements.map((movement) => ({
          ...movement,
          stockAdded: Number(movement.stockAdded) || 0,
          stockReduced:
            Number(movement.stockReduced ?? movement.quantity) || 0,
          stockBefore: Number(movement.stockBefore) || 0,
          stockAfter: Number(movement.stockAfter) || 0,
          currentStock: Number(movement.currentStock) || 0,
          price: Number(movement.price) || 0,
        }))
      );
    } catch (error) {
      console.error("Gagal mengambil laporan inventory:", error);

      setReportData([]);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data laporan."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setReportData([]);
    setHasSearched(false);
  };

  const handleDownload = () => {
    if (reportData.length === 0) {
      alert("Tidak ada data laporan untuk diunduh.");
      return;
    }

    const headers = [
      "No.",
      "Tanggal Stok Keluar",
      "Kode Produk",
      "Nama Produk",
      "Supplier",
      "Harga Satuan",
      "Stok Sebelum",
      "Stok Ditambah",
      "Stok Dikurang",
      "Stok Sesudah",
      "Stok Saat Ini",
    ];

    const rows = reportData.map((product, index) => [
      index + 1,
      formatDate(product.date),
      product.code,
      product.name,
      product.supplier,
      product.price,
      product.stockBefore,
      product.stockAdded,
      product.stockReduced,
      product.stockAfter,
      product.currentStock,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-inventory-${startDate}-sd-${endDate}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`${styles.mainContent} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        <Navbar />

        <main className={styles.page}>
          <div className={styles.header}>
            <div>
              <h1>Laporan Inventory</h1>
              <p>
                Laporan pergerakan stok produk berdasarkan tanggal stok keluar.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              icon={Download}
              onClick={handleDownload}
              disabled={reportData.length === 0 || loading}
            >
              Unduh Laporan
            </Button>
          </div>

          <section className={styles.filterCard}>
            <div className={styles.filterHeader}>
              <div className={styles.filterTitle}>
                <CalendarDays size={18} />

                <div>
                  <h2>Filter Periode</h2>
                  <p>
                    Pilih rentang tanggal terjadinya stok keluar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={styles.resetButton}
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </button>
            </div>

            <div className={styles.filterForm}>
              <div className={styles.dateField}>
                <label htmlFor="startDate">Tanggal Mulai</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.dateField}>
                <label htmlFor="endDate">Tanggal Akhir</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.filterAction}>
                <Button
                  type="button"
                  variant="primary"
                  icon={RefreshCw}
                  onClick={handleFilter}
                  disabled={loading}
                >
                  {loading ? "Memuat..." : "Tampilkan"}
                </Button>
              </div>
            </div>
          </section>

          <section className={styles.reportCard}>
            <div className={styles.reportHeader}>
              <div>
                <h2>Data Laporan</h2>
                <p>
                  {startDate && endDate
                    ? `Periode ${startDate} s/d ${endDate}`
                    : "Silakan pilih periode laporan."}
                </p>
              </div>

              <span className={styles.totalData}>
                {reportData.length} Data
              </span>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <Loading
                  size="medium"
                  text="Memuat laporan..."
                />
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Tanggal Keluar</th>
                      <th>Kode Produk</th>
                      <th>Nama Produk</th>
                      <th>Supplier</th>
                      <th>Harga Satuan</th>
                      <th>Stok Sebelum</th>
                      <th>Stok Ditambah</th>
                      <th>Stok Dikurang</th>
                      <th>Stok Sesudah</th>
                      <th>Stok Saat Ini</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className={styles.empty}>
                          {hasSearched
                            ? "Tidak ada pergerakan stok keluar pada periode ini."
                            : "Silakan pilih periode dan tampilkan laporan."}
                        </td>
                      </tr>
                    ) : (
                      reportData.map((product, index) => (
                        <tr key={`${product.id}-${product.date || index}`}>
                          <td>{index + 1}</td>
                          <td>{formatDate(product.date)}</td>
                          <td>
                            <strong>{product.code || "-"}</strong>
                          </td>
                          <td>{product.name || "-"}</td>
                          <td>{product.supplier || "-"}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{product.stockBefore}</td>
                          <td>{product.stockAdded}</td>
                          <td>{product.stockReduced}</td>
                          <td>{product.stockAfter}</td>
                          <td>
                            <strong>{product.currentStock}</strong>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Reports;