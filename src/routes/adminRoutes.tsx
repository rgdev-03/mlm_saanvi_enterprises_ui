import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { AdminDashboard } from "../pages/admin/Dashboard";
import VehicleListPage from "@/pages/admin/Vehicles";
import SalesListPage from "@/pages/admin/Sales";
import AgentsListPage from "@/pages/admin/Agents";
import AgentBinaryTree from "@/pages/admin/Referaltree";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/vehicles" element={<VehicleListPage />} />
        <Route path="/agents" element={<AgentsListPage />} />
        <Route path="/sales" element={<SalesListPage />} />
        <Route path="/referral-tree" element={<AgentBinaryTree />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
