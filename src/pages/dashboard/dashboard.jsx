import { useEffect, useState } from "react";

import {
  Package,
  Boxes,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import styles from "../../css/dashboard.module.css";

import Sidebar from "../../components/layout/sidebar";
import Navbar from "../../components/layout/navbar";
import StatCard from "../../components/dashboard/statCard";
import RequestTable from "../../components/dashboard/requestTable";
import LowStock from "../../components/dashboard/lowStock";

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [period, setPeriod] = useState("7");

  /**
   * Ambil data dashboard dari API
   */
  const fetchDashboard = async (selectedPeriod = period) => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `http://localhost:5100/api/v1/dashboard?period=${selectedPeriod}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Gagal mengambil data dashboard"
      );
    }

    setDashboardData(result.data);
  } catch (error) {
    console.error("Fetch dashboard error:", error);

    setError(
      error.message || "Gagal mengambil data dashboard"
    );
  } finally {
    setLoading(false);
  }
};
  /**
   * Fetch pertama kali ketika halaman dibuka
   */
  useEffect(() => {
    fetchDashboard("7");
  }, []);

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className={styles.appLayout}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div
          className={`${styles.mainWrapper} ${
            collapsed ? styles.collapsed : ""
          }`}
        >
          <Navbar />

          <main className={styles.dashboard}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Dashboard Inventory</h1>

                <p>
                  Memuat data dashboard...
                </p>
              </div>
            </div>

            <div className={styles.loading}>
              Memuat data...
            </div>
          </main>
        </div>
      </div>
    );
  }

  /**
   * Error
   */
  if (error) {
    return (
      <div className={styles.appLayout}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div
          className={`${styles.mainWrapper} ${
            collapsed ? styles.collapsed : ""
          }`}
        >
          <Navbar />

          <main className={styles.dashboard}>
            <div className={styles.pageHeading}>
              <div>
                <h1>Dashboard Inventory</h1>

                <p>
                  Pantau stok dan aktivitas inventory
                  secara real-time.
                </p>
              </div>
            </div>

            <div className={styles.error}>
              <p>{error}</p>

              <button
                onClick={fetchDashboard}
                type="button"
              >
                Coba Lagi
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /**
   * Data dari API
   */
  const statistics =
    dashboardData?.statistics || {};

  const stockMovement =
    dashboardData?.stockMovement || [];

  const lowStockProducts =
    dashboardData?.lowStockProducts || [];

  const recentRequests =
    dashboardData?.recentRequests || [];

  /**
   * Format angka
   */
  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(value) || 0
    );
  };

  /**
   * Tanggal hari ini
   */
  const currentDate = new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());

  return (
    <div className={styles.appLayout}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`${styles.mainWrapper} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        <Navbar />

        <main className={styles.dashboard}>
          {/* =========================
              HEADER
          ========================== */}
          <div className={styles.pageHeading}>
            <div>
              <h1>Dashboard Inventory</h1>

              <p>
                Pantau stok dan aktivitas inventory
                secara real-time.
              </p>
            </div>

            <button
              className={styles.dateButton}
              type="button"
            >
              {currentDate}
            </button>
          </div>

          {/* =========================
              STATISTICS
          ========================== */}
          <section className={styles.statsGrid}>
            <StatCard
              title="Total Produk"
              value={formatNumber(
                statistics.totalProducts
              )}
              description="Produk aktif"
              icon={
                <Package size={22} />
              }
              iconClass="blue"
            />

            <StatCard
              title="Total Stok"
              value={formatNumber(
                statistics.totalStock
              )}
              description="Unit tersedia"
              icon={
                <Boxes size={22} />
              }
              iconClass="green"
            />

            <StatCard
              title="Permintaan Pending"
              value={formatNumber(
                statistics.pendingRequests
              )}
              description="Menunggu persetujuan"
              icon={
                <ClipboardList size={22} />
              }
              iconClass="orange"
            />

            <StatCard
              title="Stok Menipis"
              value={formatNumber(
                statistics.lowStock
              )}
              description="Perlu segera direstock"
              icon={
                <AlertTriangle size={22} />
              }
              iconClass="red"
            />
          </section>

          {/* =========================
              CONTENT
          ========================== */}
          <section className={styles.contentGrid}>
            {/* =====================
                STOCK MOVEMENT
            ====================== */}

<div className={styles.chartCard}>
  <div className={styles.cardHeader}>
    <div>
      <h3>Pergerakan Stok</h3>
      <p>Aktivitas stok masuk dan keluar</p>
    </div>

    <select 
    value={period}
    onChange={(e) =>{
      const selectedPeriod= e.target.value;

      setPeriod(selectedPeriod);
      fetchDashboard(selectedPeriod);
    }} >

      <option value="7">7 Hari</option>
      <option value="30">30 Hari</option>
      <option value="90">3 Bulan</option>
    </select>
  </div>

  <div className={styles.chart}>
    {stockMovement.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={stockMovement}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 5,
          }}
          barGap={8}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
  dataKey="date"
  tickFormatter={(value) => {
    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
    }).format(date);
  }}
  tickLine={false}
  axisLine={false}
  tick={{ fontSize: 12 }}
  interval={period === "7" ? 0 : period === "30" ? 4 : 9}
  angle={period === "7" ? 0 : -35}
  textAnchor={period === "7" ? "middle" : "end"}
  height={period === "7" ? 30 : 55}
/>

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />

          <Tooltip
            formatter={(value, name) => [
              formatNumber(value),
              name,
            ]}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              paddingBottom: "15px",
            }}
          />

          <Line
            dataKey="stockIn"
            name="Stok Masuk"
            fill="#2563eb"
            radius={[5, 5, 0, 0]}
            maxBarSize={35}
          />

          <Line
            dataKey="stockOut"
            name="Stok Keluar"
            fill="#f59e0b"
            radius={[5, 5, 0, 0]}
            maxBarSize={35}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className={styles.emptyState}>
        Belum ada data pergerakan stok.
      </div>
    )}
  </div>
</div>


            {/* =====================
                LOW STOCK
            ====================== */}
            <LowStock
              products={lowStockProducts}
            />
          </section>

          {/* =========================
              REQUEST TABLE
          ========================== */}
          <RequestTable
            requests={recentRequests}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;