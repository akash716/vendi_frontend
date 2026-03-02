import React, { useState } from "react";
import { useAuth } from "./useAuth";

export default function LoginPage({ onSwitchToRegister }) {
  const { login }  = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email.trim(), password);
    } catch(err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={overlay}>
      <div style={card}>
        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🍫</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:28, color:"var(--cream4)", letterSpacing:"0.04em" }}>Vendi</div>
          <div style={{ fontSize:11, color:"var(--cream0)", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:3 }}>Chocolates · Admin</div>
        </div>

        <h2 style={{ margin:"0 0 20px", fontSize:"1.1rem", fontWeight:600, color:"var(--cream3)" }}>Sign in to continue</h2>

        {error && (
          <div style={{ background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={lbl}>Email</label>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="admin@example.com" required autoFocus
              style={{ width:"100%", boxSizing:"border-box" }}
            />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input
                type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width:"100%", boxSizing:"border-box", paddingRight:40 }}
              />
              <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--cream1)", fontSize:16, padding:0, minHeight:"unset" }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop:4, padding:"12px", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", color:"var(--bg0)", border:"none", borderRadius:11, fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", letterSpacing:"0.04em", opacity:loading?.7:1 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop:20, textAlign:"center", fontSize:13, color:"var(--cream1)" }}>
          New admin?{" "}
          <button onClick={onSwitchToRegister} style={{ background:"none", border:"none", color:"var(--gold3)", fontWeight:700, cursor:"pointer", fontSize:13, padding:0, minHeight:"unset" }}>
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = { minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 };
const card    = { background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:380, boxShadow:"0 24px 80px rgba(0,0,0,.6)" };
const lbl     = { display:"block", fontSize:11, color:"var(--cream1)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 };
