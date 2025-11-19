import { fetchRequest } from "./fetchClient";

export async function refreshTokenRequest(refreshToken: string) {
  return await fetchRequest({
    method: "POST",
    path: "/users/token/refresh/",
    payload: { refresh_token: refreshToken },
    requireAuth: false,
  });
}
