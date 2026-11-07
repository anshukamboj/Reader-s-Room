const BASE = "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("rr_token");

export const clearAuth = () => {
  localStorage.removeItem("rr_token");
  localStorage.removeItem("rr_user");
};

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}