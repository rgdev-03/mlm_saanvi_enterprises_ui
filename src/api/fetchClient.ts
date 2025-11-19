import { refreshTokenRequest } from "./api";

async function attemptRefresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await refreshTokenRequest(refreshToken);
    if (!res?.access_token) return false;

    // Normalize and save
    const newAccess = {
      token: res.access_token,
      email: res.email ?? null,
    };
    localStorage.setItem("accessToken", JSON.stringify(newAccess));
    if (res.refresh_token) {
      localStorage.setItem("refreshToken", res.refresh_token);
    }
    return true;
  } catch (err) {
    console.error("Refresh failed:", err);
    return false;
  }
}

export const fetchRequest = async ({
  method,
  path,
  payload,
  requireAuth = true,
}: {
  method: string;
  path: string;
  payload?: any;
  requireAuth?: boolean;
}) => {
  const getTokens = () => {
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");

    try {
      if (accessToken && accessToken.startsWith("{")) {
        const parsed = JSON.parse(accessToken);
        accessToken = parsed.token;
      }
    } catch { /* ignore */ }

    return { accessToken, refreshToken };
  };

  async function makeRequest() {
    const headers: Record<string, string> = {};
    let body: BodyInit | null = null;

    if (payload instanceof FormData) {
      body = payload;
    } else if (payload instanceof URLSearchParams) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      body = payload;
    } else if (payload != null) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload);
    }

    const { accessToken } = getTokens();
    if (requireAuth && accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}${path}`, {
      method,
      headers,
      body,
    });

    const contentType = res.headers.get("content-type");
    if (
      contentType &&
      (contentType.includes("application/octet-stream") ||
        contentType.includes("application/pdf") ||
        contentType.includes("application/vnd.ms-powerpoint") ||
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ))
    ) {
      if (!res.ok) throw { status: res.status, message: await res.text() };
      return await res.blob();
    }

    const text = await res.text();
    if (!res.ok) throw { status: res.status, message: text };

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return await makeRequest();
  } catch (err: any) {
    // Attempt refresh if 401 or 404
    if (
      (err.status === 401 || err.status === 404) &&
      requireAuth &&
      (await attemptRefresh())
    ) {
      return await makeRequest();
    }

    // 🚨 Refresh failed -> clear tokens and redirect to login
    if (err.status === 401 || err.status === 404) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 🔴 Redirect to login page
      window.location.href = "/auth/login";
    }

    throw err;
  }
};
