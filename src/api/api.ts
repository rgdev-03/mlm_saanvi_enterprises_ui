import { fetchRequest } from "./fetchClient";

export async function refreshTokenRequest(refreshToken: string) {
  return await fetchRequest({
    method: "POST",
    path: "/users/token/refresh/",
    payload: { refresh_token: refreshToken },
    requireAuth: false,
  });
}
// Agents endpoints
export async function getAgents(queryString = "") {
  return await fetchRequest({
    method: "GET",
    path: `/users/all/${queryString}`,
    requireAuth: true,
  });
}

export async function createAgent(payload: {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  sponsor_code?: string;
  role?: string;
}) {
  return await fetchRequest({
    method: "POST",
    path: "/users/register/",
    payload,
    requireAuth: true,
  });
}
export async function getDownlineById(userId: string) {
  return await fetchRequest({
    method: "GET",
    path: `/users/downline/by-id/${userId}/`,
    requireAuth: true,
  });
}
export async function getVehicles(queryString = "") {
  return await fetchRequest({
    method: "GET",
    path: `/vehicles/${queryString}`,   // ⬅️ append query string here
    requireAuth: true,
  });
}
// Sales endpoints
export async function getSales(queryString = "") {
  return await fetchRequest({
    method: "GET",
    path: `/sales/${queryString}`,
    requireAuth: true,
  });
}

export async function createSale(payload: {
  agent: string;
  vehicle: string;
  customer_name: string;
  amount: string;
  status: string;
  sale_date?: string;
}) {
  return await fetchRequest({
    method: "POST",
    path: "/sales/",
    payload,
    requireAuth: true,
  });
}

export async function updateSale(saleId: string, updates: Partial<{
  agent: string;
  vehicle: string;
  customer_name: string;
  amount: string;
  status: string;
  sale_date?: string;
}>) {
  return await fetchRequest({
    method: "PATCH",
    path: `/sales/${saleId}/`,
    payload: updates,
    requireAuth: true,
  });
}

export async function deleteSale(saleId: string) {
  return await fetchRequest({
    method: "DELETE",
    path: `/sales/${saleId}/`,
    requireAuth: true,
  });
}
export async function createVehicle(vehicle: {
  brand: string;
  name: string;
  model_number: string;
  price: string;
  points: string;
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
  points: string;
}>) {
  return await fetchRequest({
    method: "PATCH",
    path: `/vehicles/${vehicleId}/`,
    payload: updates,
    requireAuth: true,
  });
}
