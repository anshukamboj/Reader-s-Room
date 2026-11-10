const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .trim()
  .replace(/^[\["']+|[\]"']+$/g, "")
  .replace(/\/+$/, "");

const BASE = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

export const getToken = () => localStorage.getItem("rr_token");

export const clearAuth = () => {
  localStorage.removeItem("rr_token");
  localStorage.removeItem("rr_user");
};

export async function api(path, { method = "GET", body } = {}) {
  const url = BASE + (path.startsWith("/") ? path : `/${path}`);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API request failed: [${method} ${url}]`, err);
    throw err;
  }
}