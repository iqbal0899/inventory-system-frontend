
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import styles from "../../css/navbar.module.css";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleSettings = () => {
    setShowMenu(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate("/login");
  };

  const userName =(
    user?.name || user?.username|| "Pengguna").toUpperCase();

  const userRole = user?.role || "Staff";

  const initials = userName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className={styles.navbar}>
      <div className={styles.search}>
        <Search size={19} />

        <input
          type="text"
          placeholder="Cari produk, request, supplier..."
        />
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.notificationButton}
          aria-label="Notifikasi"
        >
          <Bell size={20} />
          <span className={styles.notificationDot} />
        </button>

        <div className={styles.profileWrapper}>
          <button
            type="button"
            className={styles.userProfile}
            onClick={() =>
              setShowMenu((previous) => !previous)
            }
          >
            <div className={styles.avatar}>
              {initials}
            </div>

            <div className={styles.userInfo}>
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>

            <ChevronDown
              size={17}
              className={
                showMenu ? styles.chevronOpen : ""
              }
            />
          </button>

          {showMenu && (
            <div className={styles.profileMenu}>
              <button
                type="button"
                onClick={handleSettings}
                className={styles.menuItem}
              >
                <Settings size={18} />
                <span>Pengaturan</span>
              </button>

              <div className={styles.menuDivider} />

              <button
                type="button"
                onClick={handleLogout}
                className={`${styles.menuItem} ${styles.logoutItem}`}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
