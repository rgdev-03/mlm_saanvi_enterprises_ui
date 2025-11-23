import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { AdminDashboard } from "../pages/admin/Dashboard";
import VehicleListPage from "@/pages/admin/Vehicles";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/vehicles" element={<VehicleListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
