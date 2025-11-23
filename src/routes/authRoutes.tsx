import { Route, Routes, Navigate } from "react-router-dom";
import { SignUp } from "../pages/auth/signup";
import Login from "@/pages/auth/Login";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<SignUp />} />
    </Routes>
  );
}
