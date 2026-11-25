import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "@/pages/Login";

import AdminLogin from "./pages/admin/AdminLogin";
import { getRoleFromToken } from "@/lib/utils";

const GuestRoute = () => {
  const isAuthenticated = localStorage.getItem("token");

  if (isAuthenticated) {
    const userRole = getRoleFromToken();
    // handle ketika role mengakses bukan page nya
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    return (
      <Navigate to={userRole === "guru" ? "/guru" : "/MainPage"} replace />
    );
  }

  return <Outlet />;
};

const MuridRoute = () => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = getRoleFromToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === "guru") {
    return <Navigate to="/guru" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

const TeacherRoute = () => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = getRoleFromToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (userRole !== "guru") {
    return <Navigate to="/MainPage" replace />;
  }

  return <Outlet />;
};

const AdminRoute = () => {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = getRoleFromToken();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/MainPage" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public route */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
