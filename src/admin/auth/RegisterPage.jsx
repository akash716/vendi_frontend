import React, { useState } from "react";
import { useAuth } from "./useAuth";

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 6)  return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch(err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={overlay}>
      <div style={card}>
        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🍫</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:26, color:"var(--cream4)", letterSpacing:"0.04em" }}>Vendi Admin</div>
          <div style={{ fontSize:11, color:"var(--cream0)", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:3 }}>Create Account</div>
        </div>

        {error && (
          <div style={{ background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:14 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={lbl}>Your Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rahul Sharma" required autoFocus style={{ width:"100%", boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" required style={{ width:"100%", boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" required style={{ width:"100%", boxSizing:"border-box", paddingRight:40 }}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--cream1)", fontSize:15, padding:0, minHeight:"unset" }}>
                {showPass?"🙈":"👁"}
              </button>
            </div>
          </div>
          <div>
            <label style={lbl}>Confirm Password</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" required style={{ width:"100%", boxSizing:"border-box" }}/>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop:4, padding:"12px", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", color:"var(--bg0)", border:"none", borderRadius:11, fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
            {loading ? "Creating…" : "Create Admin Account →"}
          </button>
        </form>

        <div style={{ marginTop:18, textAlign:"center", fontSize:13, color:"var(--cream1)" }}>
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} style={{ background:"none", border:"none", color:"var(--gold3)", fontWeight:700, cursor:"pointer", fontSize:13, padding:0, minHeight:"unset" }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = { minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 };
const card    = { background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:380, boxShadow:"0 24px 80px rgba(0,0,0,.6)" };
const lbl     = { display:"block", fontSize:11, color:"var(--cream1)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:5 };
