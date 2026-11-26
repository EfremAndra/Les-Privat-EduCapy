
import { useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "@/pages/Login";
import AdminLogin from "./pages/admin/AdminLogin";

import UpperMenu from "./component/ui/uppermenu";
import Sidebar from "./component/ui/sidebar";

import MainPage from "./pages/murid/MainPages";
import DashboardPage from "./pages/guru/DashboardPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ManajemenMurid from "@/pages/admin/ManajemenMurid";
import ManajemenGuru from "@/pages/admin/ManajemenGuru";

import { getRoleFromToken } from "@/lib/utils";

const DashboardLayout = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="flex h-screen w-full bg-[#FDFDFD] overflow-hidden">
      <Sidebar isExpanded={isExpanded} />

      <main className="flex-1 overflow-y-auto">
        <UpperMenu
          onCloseSidebar={() => setIsExpanded(!isExpanded)}
        />
        <Outlet />
      </main>
    </div>
  );
};

const GuestRoute = () => {
  const isAuthenticated = localStorage.getItem("token");

  if (isAuthenticated) {
    const userRole = getRoleFromToken();

    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return (
      <Navigate
        to={userRole === "guru" ? "/guru" : "/MainPage"}
        replace
      />
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
        {/* Public route */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        <Route path="/" element={<Navigate to="/MainPage" replace />} />

        {/* Murid route */}
        <Route element={<MuridRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/MainPage" element={<MainPage />} />
          </Route>
        </Route>

        {/* Guru route */}
        <Route element={<TeacherRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/guru" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Admin route */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route
              path="/admin/manajemen-murid"
              element={<ManajemenMurid />}
            />

            <Route
              path="/admin/manajemen-guru"
              element={<ManajemenGuru />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
