
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getMe,
  login as loginApi,
  logout as logoutApi,
} from "../services/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const result = await getMe();
      const userData = result?.user ?? result?.data?.user;

      if (!result?.success || !userData) {
        setUser(null);
        setAuthError("Sesi login tidak valid.");
        return;
      }

      setUser(userData);
      setAuthError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        setAuthError(null);
      } else {
        setAuthError(
          "Gagal memeriksa sesi. Periksa koneksi ke server."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const result = await loginApi(username, password);
    const userData = result?.user ?? result?.data?.user;

    if (!userData) {
      console.error("LOGIN RESPONSE:", result);
      throw new Error("Data user tidak ditemukan pada respons login.");
    }

    setUser(userData);
    setAuthError(null);

    return result;
  }

  async function logout() {
    try {
      await logoutApi();
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error.response?.data?.message || error.message
      );
      throw error;
    } finally {
      setUser(null);
      setAuthError(null);
    }
  }

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        logout,
        checkAuth,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}