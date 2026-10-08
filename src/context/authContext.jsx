import {
  createContext,
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

  async function checkAuth() {
    try {
      const result = await getMe();

      setUser(result.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const result = await loginApi(username, password);

    setUser(result.data.user);

    return result;
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}