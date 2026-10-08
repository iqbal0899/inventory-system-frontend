import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  Truck,
  ShoppingCart,
  FileText,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Users
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../css/sidebar.module.css";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Produk", icon: Package, path: "/products" },
  { label: "Stok", icon: Boxes, path: "/stock" },
  { label: "Permintaan Kasir", icon: ClipboardList, path: "/requests" },
  { label: "Supplier", icon: Truck, path: "/suppliers" },
  { label: "Pembelian", icon: ShoppingCart, path: "/purchases" },
  { label: "Laporan", icon: FileText, path: "/reports" },
  { label: "Audit Log", icon: History, path: "/audit-logs" },
  { label: "Data User", icon: Users, path: "/users" },
];

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.collapsed : ""
      }`}
    >
      <div className={styles.sidebarBrand}>
        <div className={styles.brandIcon}>TI</div>

        {!collapsed && (
          <div className={styles.brandInfo}>
            <h2>Toko Iqbal</h2>
            <span>Inventory</span>
          </div>
        )}

        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setCollapsed((previous) => !previous)}
          title={
            collapsed
              ? "Tampilkan sidebar"
              : "Sembunyikan sidebar"
          }
          aria-label={
            collapsed
              ? "Tampilkan sidebar"
              : "Sembunyikan sidebar"
          }
        >
          {collapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.8} />
          ) : (
            <PanelLeftClose size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>

      <div className={styles.menuSection}>
        {!collapsed && (
          <p className={styles.menuTitle}>MENU UTAMA</p>
        )}

        <nav className={styles.sidebarMenu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className={`${styles.menuItem} ${
                  isActive ? styles.active : ""
                }`}
                title={collapsed ? item.label : ""}
              >
                <Icon size={19} strokeWidth={1.8} />

                {!collapsed && (
                  <span className={styles.menuLabel}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;