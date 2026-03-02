import { useState, useEffect, createContext, useContext } from "react";

import API_URL from "../../config";
const API = `${API_URL}/api`;
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null);   // { name, email, token }
  const [loading, setLoading] = useState(true);  // checking stored token

  // On mount — check if token in localStorage is still valid
  useEffect(() => {
    const stored = localStorage.getItem("vendi_admin_token");
    if (!stored) { setLoading(false); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${stored}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setAdmin({ ...data, token: stored });
        else localStorage.removeItem("vendi_admin_token");
      })
      .catch(() => localStorage.removeItem("vendi_admin_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res  = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("vendi_admin_token", data.token);
    setAdmin({ name: data.name, email: data.email, token: data.token });
    return data;
  };

  const register = async (name, email, password) => {
    const stored = localStorage.getItem("vendi_admin_token");
    const res  = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(stored ? { Authorization: `Bearer ${stored}` } : {}),
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    // Auto-login after register if no admin was logged in
    if (!admin) {
      localStorage.setItem("vendi_admin_token", data.token);
      setAdmin({ name: data.name, email: data.email, token: data.token });
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("vendi_admin_token");
    setAdmin(null);
  };

  // Attach token to every admin API call
  const authFetch = (url, opts = {}) => {
    const token = admin?.token || localStorage.getItem("vendi_admin_token");
    return fetch(url, {
      ...opts,
      headers: {
        ...opts.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
