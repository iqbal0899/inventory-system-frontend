import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/authContext";

import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard/dashboard";
import Products from "./pages/products/products";
import Stock from "./pages/stock/stock";
import Request from "./pages/requests/requests";
import Supplier from "./pages/suppliers/suppliers";
import SupplierDetail from "./pages/suppliers/supplierDetail";
import Report from "./pages/reports/reports";
import Users from "./pages/users/users";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Request />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <Supplier />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers/:id"
          element={
            <ProtectedRoute>
              <SupplierDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
        <Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;