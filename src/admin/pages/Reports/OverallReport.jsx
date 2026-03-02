import React, { useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import API_URL from "../../../config";

function Spin({on}) {
  return <span style={{ display:"inline-block", animation: on?"spin 0.8s linear infinite":"none", fontSize:16 }}>↻</span>;
}

export default function OverallReport({ startDate, endDate }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true); setRows([]);
      const res  = await adminFetch(`${API_URL}/api/admin/reports/overall/summary?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows(Array.isArray(data) ? data : []);
    } catch { alert("Failed to load overall report."); }
    finally { setLoading(false); }
  };

  const grandRevenue = rows.reduce((s,r)=>s+Number(r.total_revenue||0),0);
  const grandBills   = rows.reduce((s,r)=>s+Number(r.total_bills||0),0);

  const byCompany = {};
  rows.forEach(r => {
    const co = r.company||"Unknown";
    if (!byCompany[co]) byCompany[co] = { revenue:0, bills:0, stalls:[] };
    byCompany[co].revenue += Number(r.total_revenue||0);
    byCompany[co].bills   += Number(r.total_bills||0);
    byCompany[co].stalls.push(r);
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ margin:0 }}>🏢 Overall Report</h3>
        <div style={{ display:"flex", gap:8 }}>
          {rows.length>0 && (
            <button onClick={load} disabled={loading} style={iconBtn} title="Refresh">
              <Spin on={loading}/>
            </button>
          )}
          <button onClick={load} disabled={loading} style={goldBtn}>
            {loading ? <Spin on/> : null} Load Report
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--c-text-4)" }}>
          <div style={{ fontSize:28 }}>🍫</div>
          <div style={{ fontSize:13, marginTop:6 }}>Loading…</div>
        </div>
      )}

      {!loading && rows.length===0 && (
        <p style={{ color:"var(--c-text-4)", textAlign:"center", padding:"32px 0", fontSize:13 }}>
          Select a date range above and click "Load Report".
        </p>
      )}

      {rows.length>0 && (
        <>
          {/* Grand totals */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
            <StatCard label="Grand Revenue" value={`₹${grandRevenue.toLocaleString("en-IN")}`} color="var(--c-green)" bg="var(--c-green-bg)"/>
            <StatCard label="Total Bills"   value={grandBills}  color="var(--c-blue)"  bg="var(--c-blue-bg)"/>
            <StatCard label="Stalls Active" value={rows.length} color="var(--c-gold)"  bg="var(--c-gold-dim)"/>
          </div>

          {/* By company */}
          {Object.entries(byCompany).map(([co, data]) => (
            <div key={co} style={{ marginBottom:20, borderRadius:12, border:"1px solid var(--c-border)", overflow:"hidden", background:"var(--c-surface)" }}>
              <div style={{
                padding:"12px 16px", borderBottom:"1px solid var(--c-border)",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                background:"var(--c-bg-3)"
              }}>
                <div>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.1rem", color:"var(--c-cream)" }}>{co}</span>
                  <span style={{ marginLeft:10, fontSize:12, color:"var(--c-text-4)" }}>{data.stalls.length} stall{data.stalls.length!==1?"s":""}</span>
                </div>
                <div style={{ display:"flex", gap:16 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"var(--c-text-4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Revenue</div>
                    <div style={{ fontWeight:700, color:"var(--c-green)", fontSize:15 }}>₹{data.revenue.toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"var(--c-text-4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Bills</div>
                    <div style={{ fontWeight:700, color:"var(--c-blue)", fontSize:15 }}>{data.bills}</div>
                  </div>
                </div>
              </div>
              <table className="v-table">
                <thead><tr><th>Stall</th><th>Bills</th><th>Revenue</th><th>Avg / Bill</th></tr></thead>
                <tbody>
                  {data.stalls.map((r,i)=>(
                    <tr key={i}>
                      <td style={{ fontWeight:500 }}>{r.stall_name}</td>
                      <td style={{ color:"var(--c-text-2)" }}>{r.total_bills}</td>
                      <td style={{ fontWeight:700, color:"var(--c-green)" }}>₹{Number(r.total_revenue||0).toLocaleString("en-IN")}</td>
                      <td style={{ color:"var(--c-gold)" }}>₹{Number(r.avg_bill||0).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ flex:1, minWidth:160, padding:"14px 16px", borderRadius:12, background:bg, border:`1px solid ${color}22` }}>
      <div style={{ fontSize:10, color, opacity:0.7, marginBottom:6, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

const goldBtn  = { padding:"8px 18px", background:"var(--c-gold)", color:"var(--c-bg)", border:"none", borderRadius:9, fontWeight:700, cursor:"pointer", fontSize:13, minHeight:"unset", display:"flex", alignItems:"center", gap:6 };
const iconBtn  = { width:34, height:34, borderRadius:9, border:"1px solid var(--c-border)", background:"transparent", color:"var(--c-text-3)", cursor:"pointer", fontSize:16, minHeight:"unset" };
