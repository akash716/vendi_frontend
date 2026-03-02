import React, { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import API_URL from "../../config";

const API = `${API_URL}/api/admin`;

function StatCard({ icon, label, value, color, bg, sub }) {
  return (
    <div style={{ background:bg||"var(--bg4)", border:`1px solid ${color}22`, borderRadius:13, padding:"14px 16px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:12, top:10, fontSize:22, opacity:.12 }}>{icon}</div>
      <div style={{ fontSize:10, color, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>{label}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color, lineHeight:1, margin:"6px 0 4px" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"var(--cream0)" }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stalls,  setStalls]  = useState([]);
  const [candies, setCandies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch(`${API}/stalls`).then(r=>r.json()),
      adminFetch(`${API}/candies`).then(r=>r.json()),
    ]).then(([s,c]) => {
      setStalls(Array.isArray(s)?s:[]);
      setCandies(Array.isArray(c)?c:[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign:"center", padding:"80px 0", color:"var(--cream0)" }}>
      <div style={{ fontSize:44, marginBottom:10 }}>🍫</div>
      <div style={{ fontSize:13 }}>Loading…</div>
    </div>
  );

  const active = stalls.filter(s=>s.is_active).length;
  const catMap  = {};
  candies.forEach(c => { const k=c.category||"Other"; catMap[k]=(catMap[k]||0)+1; });

  return (
    <div style={{ maxWidth:960 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:600, color:"var(--cream4)", marginBottom:4 }}>Welcome back 👋</div>
        <p style={{ color:"var(--cream1)", fontSize:13, margin:0 }}>Overview of your Vendi Chocolates operations.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12, marginBottom:24 }}>
        <StatCard icon="🏪" label="Total Stalls"   value={stalls.length}  color="var(--gold3)"  sub={`${active} active`}/>
        <StatCard icon="✅" label="Active Stalls"  value={active}          color="var(--green)"  bg="var(--green-bg)"/>
        <StatCard icon="🍫" label="Total Candies"  value={candies.length}  color="var(--blue)"   bg="var(--blue-bg)"/>
        <StatCard icon="📦" label="Categories"     value={Object.keys(catMap).length} color="var(--c-purple)" bg="var(--c-purple-bg)"/>
      </div>

      {/* Stalls table */}
      {stalls.length > 0 && (
        <div style={{ borderRadius:13, border:"1px solid var(--border1)", overflow:"hidden", background:"var(--bg3)", marginBottom:20 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border0)", background:"var(--bg2)" }}>
            <h3 style={{ margin:0, fontSize:"1rem" }}>🏪 Stalls</h3>
          </div>
          {/* Mobile cards */}
          <div className="dash-mobile-stalls">
            {stalls.slice(0,6).map(s=>(
              <div key={s.id} style={{ padding:"12px 16px", borderBottom:"1px solid var(--border0)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:600, color:"var(--cream4)", fontSize:14 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"var(--cream1)", marginTop:1 }}>{s.company||"—"} {s.salesman_name?`· ${s.salesman_name}`:""}</div>
                </div>
                <span className={s.is_active?"badge badge-green":"badge badge-muted"} style={{ fontSize:10 }}>{s.is_active?"Active":"Off"}</span>
              </div>
            ))}
          </div>
          <style>{`.dash-mobile-stalls { display:block } .dash-desk-table { display:none } @media(min-width:600px){ .dash-mobile-stalls{display:none} .dash-desk-table{display:block} }`}</style>
          <div className="dash-desk-table">
            <table className="v-table">
              <thead><tr><th>Name</th><th>Company</th><th>Salesman</th><th>Status</th></tr></thead>
              <tbody>
                {stalls.slice(0,8).map(s=>(
                  <tr key={s.id}>
                    <td style={{ fontWeight:500 }}>{s.name}</td>
                    <td style={{ color:"var(--cream1)", fontSize:12 }}>{s.company||"—"}</td>
                    <td style={{ color:"var(--cream1)", fontSize:12 }}>{s.salesman_name||"—"}</td>
                    <td><span className={s.is_active?"badge badge-green":"badge badge-muted"}>{s.is_active?"Active":"Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories */}
      {Object.keys(catMap).length > 0 && (
        <div style={{ borderRadius:13, border:"1px solid var(--border1)", overflow:"hidden", background:"var(--bg3)" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border0)", background:"var(--bg2)" }}>
            <h3 style={{ margin:0, fontSize:"1rem" }}>🍫 Candy Categories</h3>
          </div>
          <div style={{ padding:14, display:"flex", gap:8, flexWrap:"wrap" }}>
            {Object.entries(catMap).map(([cat,count])=>(
              <div key={cat} style={{ padding:"8px 14px", borderRadius:9, background:"var(--bg5)", border:"1px solid var(--border1)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontWeight:600, color:"var(--cream4)", fontSize:13 }}>{cat}</span>
                <span style={{ background:"var(--c-gold-dim)", color:"var(--gold3)", padding:"1px 7px", borderRadius:99, fontSize:11, fontWeight:700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
