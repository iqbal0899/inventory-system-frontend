
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import styles from "../../css/stockMovementChart.module.css";

function StockMovementChart({ data = [] }) {
  const chartData = data.map((item) => ({
    day: item.day || item.date,
    stockIn: Number(item.stockIn) || 0,
    stockOut: Number(item.stockOut) || 0,
  }));

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(value);

  return (
    <section className={styles.chartCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Pergerakan Stok</h3>
          <p>Aktivitas stok masuk dan keluar</p>
        </div>
      </div>

      <div className={styles.chart}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatNumber}
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

              <Bar
                dataKey="stockIn"
                name="Stok Masuk"
                fill="#2563eb"
                radius={[5, 5, 0, 0]}
                maxBarSize={35}
              />

              <Bar
                dataKey="stockOut"
                name="Stok Keluar"
                fill="#f59e0b"
                radius={[5, 5, 0, 0]}
                maxBarSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyState}>
            Belum ada data pergerakan stok.
          </div>
        )}
      </div>
    </section>
  );
}

export default StockMovementChart;
