import { fetchRequest } from "./fetchClient";

export async function refreshTokenRequest(refreshToken: string) {
  return await fetchRequest({
    method: "POST",
    path: "/users/token/refresh/",
    payload: { refresh_token: refreshToken },
    requireAuth: false,
  });
}
export async function getVehicles(queryString = "") {
  return await fetchRequest({
    method: "GET",
    path: `/vehicles/${queryString}`,   // ⬅️ append query string here
    requireAuth: true,
  });
}
export async function createVehicle(vehicle: {
  brand: string;
  name: string;
  model_number: string;
  price: string;
  commission_base: string;
}) {
  return await fetchRequest({
    method: "POST",
    path: "/vehicles/",
    payload: vehicle,
    requireAuth: true,
  });
}

export async function deleteVehicle(vehicleId: string) {
  return await fetchRequest({
    method: "DELETE",
    path: `/vehicles/${vehicleId}/`,
    requireAuth: true,
  });
}

export async function updateVehicle(vehicleId: string, updates: Partial<{
  brand: string;
  name: string;
  model_number: string;
  price: string;
  commission_base: string;
}>) {
  return await fetchRequest({
    method: "PATCH",
    path: `/vehicles/${vehicleId}/`,
    payload: updates,
    requireAuth: true,
  });
}
