import API_URL from "../../config";

const API_BASE = API_URL;

export function adminFetch(url, opts = {}) {
  const token = localStorage.getItem("vendi_admin_token");
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  return fetch(fullUrl, {
    ...opts,
    headers: {
      ...opts.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export default adminFetch;