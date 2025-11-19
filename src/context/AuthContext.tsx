import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchRequest } from '../api/fetchClient';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  userName: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { full_name: string; email: string; password: string; role_id?: number }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const accessTokenRaw = localStorage.getItem("accessToken");
    let accessToken: string | null = null;
    let email: string | null = null;
    if (accessTokenRaw) {
      try {
        const parsed = JSON.parse(accessTokenRaw);
        accessToken = parsed.token;
        email = parsed.email;
      } catch {
        accessToken = accessTokenRaw;
      }
    }
    if (accessToken) {
      setIsAuthenticated(true);
      setToken(accessToken);
      setUserEmail(email);
      setUserName(email ? email.split('@')[0] : null);
    } else {
      setIsAuthenticated(false);
      setToken(null);
      setUserEmail(null);
      setUserName(null);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!username || !password) {
        return { success: false, error: "Username and password are required" };
      }
      const res = await fetchRequest({
        method: "POST",
        path: "/users/login/", 
        payload: { username, password },
        requireAuth: false,
      });
      // Normalize token fields - some backends return { access, refresh }
      const accessToken = res?.access_token ?? res?.access;
      const refreshToken = res?.refresh_token ?? res?.refresh;
      if (accessToken) {
        localStorage.setItem("accessToken", JSON.stringify({ token: accessToken, email: res?.email ?? username }));
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        setIsAuthenticated(true);
        setToken(accessToken);
        setUserEmail(res?.email ?? username);
        setUserName(res?.email ? res.email.split('@')[0] : username);
        return { success: true };
      }

      // Some APIs return the token under data or with different messages
      if (res?.data?.access || res?.data?.access_token) {
        const dataAccess = res.data.access ?? res.data.access_token;
        const dataRefresh = res.data.refresh ?? res.data.refresh_token;
        localStorage.setItem("accessToken", JSON.stringify({ token: dataAccess, email: res?.email ?? username }));
        if (dataRefresh) localStorage.setItem("refreshToken", dataRefresh);
        setIsAuthenticated(true);
        setToken(dataAccess);
        setUserEmail(res?.email ?? username);
        setUserName(res?.email ? res.email.split('@')[0] : username);
        return { success: true };
      }

      return { success: false, error: res?.message || res?.detail || "Invalid credentials" };
    } catch (error: any) {
      return { success: false, error: error?.message || "Login failed" };
    }
  };


  const signup = async (data: {
    full_name: string;
    email: string;
    password: string;
    role_id?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.full_name || !data.email || !data.password) {
        return { success: false, error: "All fields are required" };
      }
      const res = await fetchRequest({
        method: "POST",
        path: "/users/register/", // Adjust path as per your API
        payload: data,
        requireAuth: false,
      });
      if (res?.access_token) {
        localStorage.setItem("accessToken", JSON.stringify({ token: res.access_token, email: res.email ?? data.email }));
        if (res.refresh_token) {
          localStorage.setItem("refreshToken", res.refresh_token);
        }
        setIsAuthenticated(true);
        setToken(res.access_token);
        setUserEmail(res.email ?? data.email);
        setUserName(data.full_name);
        return { success: true };
      } else {
        return { success: false, error: res?.message || "Signup failed" };
      }
    } catch (error: any) {
      return { success: false, error: error?.message || "Signup failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setToken(null);
    setUserEmail(null);
    setUserName(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    userEmail,
    userName,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
