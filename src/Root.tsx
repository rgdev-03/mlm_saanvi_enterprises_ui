import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./context/AuthContext";
import AdminRoutes from "./routes/adminRoutes";
import AuthRoutes from "./routes/authRoutes";

export const Root = () => {
  const { isAuthenticated, loading } = useAuth();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      }
    }
  });

  const MIN_LOADER_TIME = 700;
  const [minTimerDone, setMinTimerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimerDone(true), MIN_LOADER_TIME);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !minTimerDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#d7eee4] to-[#e9f5f0]">
        <div className="relative w-40 h-40 mb-6">
          <div className="text-center">
            <h2 className="text-[#244C45] font-semibold">Loading....</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Protected admin routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AdminRoutes />
            ) : (
              <Navigate to="/auth/login" state={{ from: window.location.pathname }} replace />
            )
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/admin" : "/auth/login"} replace />} />
      </Routes>
    </QueryClientProvider>
  );
};
