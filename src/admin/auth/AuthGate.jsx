import React, { useState } from "react";
import { useAuth } from "./useAuth";
import LoginPage    from "./LoginPage";
import RegisterPage from "./RegisterPage";

/**
 * Wraps admin routes — shows login/register if not authenticated
 */
export default function AuthGate({ children }) {
  const { admin, loading } = useAuth();
  const [page, setPage]    = useState("login"); // "login" | "register"

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:44 }}>🍫</div>
      <div style={{ color:"var(--cream1)", fontSize:13 }}>Loading…</div>
    </div>
  );

  if (!admin) {
    if (page === "register") return <RegisterPage onSwitchToLogin={() => setPage("login")}/>;
    return <LoginPage onSwitchToRegister={() => setPage("register")}/>;
  }

  return children;
}
