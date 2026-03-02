import React, { useEffect, useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import OverallReport from "./OverallReport";
import Bills from "./Bills";
import API_URL from "../../../config";

const fmtDate    = (d) => d.toISOString().slice(0,10);
const today      = () => fmtDate(new Date());
const daysAgo    = (n) => { const d=new Date(); d.setDate(d.getDate()-n); return fmtDate(d); };
const monthStart = () => { const d=new Date(); d.setDate(1); return fmtDate(d); };

const SHORTCUTS = [
  { label:"Today",      fn:()=>[today(),today()] },
  { label:"Yesterday",  fn:()=>[daysAgo(1),daysAgo(1)] },
  { label:"This Week",  fn:()=>[daysAgo(6),today()] },
  { label:"This Month", fn:()=>[monthStart(),today()] },
];

function Spin({on}) {
  return <span style={{ display:"inline-block", animation: on ? "spin 0.8s linear infinite":"none" }}>↻</span>;
}

function StatBox({ label, value, color, bg }) {
  return (
    <div style={{ flex:1, padding:"16px 18px", borderRadius:12, background:bg, border:`1px solid ${color}22` }}>
      <div style={{ fontSize:11, color, opacity:0.7, marginBottom:6, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab]   = useState("STALL");
  const [stalls,    setStalls]      = useState([]);
  const [stallId,   setStallId]     = useState("");
  const [startDate, setStartDate]   = useState(today());
  const [endDate,   setEndDate]     = useState(today());
  const [shortcut,  setShortcut]    = useState("Today");
  const [summary,   setSummary]     = useState(null);
  const [candies,   setCandies]     = useState([]);
  const [combos,    setCombos]      = useState([]);
  const [inventory, setInventory]   = useState([]);
  const [loading,   setLoading]     = useState(false);

  useEffect(() => {
    adminFetch(`${API_URL}/api/admin/stalls`).then(r=>r.json())
      .then(d => setStalls(Array.isArray(d)?d:[]));
  }, []);

  const applyShortcut = (s) => {
    const [a,b] = s.fn(); setStartDate(a); setEndDate(b); setShortcut(s.label);
  };

  const loadReport = async () => {
    if (!stallId) return alert("Please select a stall first.");
    setLoading(true); setSummary(null); setCandies([]); setCombos([]); setInventory([]);
    const base = `${API_URL}/api/admin/reports`;
    const q    = `stall_id=${stallId}&start_date=${startDate}&end_date=${endDate}`;
    try {
      const [s,c,cb,inv] = await Promise.all([
        adminFetch(`${base}/stall/summary?${q}`).then(r=>r.json()),
        adminFetch(`${base}/stall/candies?${q}`).then(r=>r.json()),
        adminFetch(`${base}/stall/combos?${q}`).then(r=>r.json()),
        adminFetch(`${base}/stall/inventory?stall_id=${stallId}`).then(r=>r.json()),
      ]);
      setSummary(s); setCandies(Array.isArray(c)?c:[]); setCombos(Array.isArray(cb)?cb:[]); setInventory(Array.isArray(inv)?inv:[]);
    } catch { alert("Failed to load report."); }
    finally { setLoading(false); }
  };

  const TABS = [["STALL","🏪 Stall Reports"],["OVERALL","🏢 Overall"],["BILLS","🧾 Bills"]];

  return (
    <div style={{ maxWidth:1100 }}>
      <style>{`
        @media(max-width:600px){
          .rpt-filter { flex-direction:column !important; align-items:stretch !important; }
          .rpt-filter select { width:100% !important; }
          .rpt-stats { flex-direction:column !important; }
          .rpt-stats > div { min-width:unset !important; }
        }
      `}</style>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:8, marginBottom:24,
        background:"var(--c-bg-3)", padding:5, borderRadius:12,
        border:"1px solid var(--c-border)", width:"fit-content" }}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{
            padding:"9px 18px", borderRadius:9, border:"none",
            background: activeTab===k ? "linear-gradient(135deg,var(--c-gold),var(--c-gold-2))" : "transparent",
            color: activeTab===k ? "var(--c-bg)" : "var(--c-text-3)",
            fontWeight: activeTab===k ? 700 : 500, fontSize:13, cursor:"pointer",
            transition:"all 0.15s", minHeight:"unset",
          }}>{l}</button>
        ))}
      </div>

      {/* Filter bar */}
      {(activeTab==="STALL"||activeTab==="OVERALL") && (
        <div style={{
          display:"flex", gap:10, padding:"14px 16px",
          borderRadius:12, border:"1px solid var(--c-border)",
          marginBottom:24, flexWrap:"wrap", alignItems:"center",
          background:"var(--c-surface)",
        }}>
          {activeTab==="STALL" && (
            <select value={stallId} onChange={e=>setStallId(e.target.value)}
              style={{ minWidth:200, width:"auto" }}>
              <option value="">Select Stall</option>
              {stalls.map(s=><option key={s.id} value={s.id}>{s.name} — {s.company}</option>)}
            </select>
          )}

          {/* Shortcuts */}
          <div style={{ display:"flex", gap:6 }}>
            {SHORTCUTS.map(s=>(
              <button key={s.label} onClick={()=>applyShortcut(s)} style={{
                padding:"5px 12px", borderRadius:20, border:"1px solid",
                fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.12s",
                background:  shortcut===s.label ? "var(--c-gold)" : "transparent",
                color:       shortcut===s.label ? "var(--c-bg)"   : "var(--c-text-3)",
                borderColor: shortcut===s.label ? "var(--c-gold)" : "var(--c-border)",
                minHeight:"unset",
              }}>{s.label}</button>
            ))}
          </div>

          <div style={{ width:1, height:24, background:"var(--c-border)", flexShrink:0 }}/>

          {/* Date range */}
          {[["From",startDate,v=>{setStartDate(v);setShortcut("");}],
            ["To",  endDate,  v=>{setEndDate(v);  setShortcut("");}]].map(([lbl,val,fn])=>(
            <div key={lbl} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontSize:12, color:"var(--c-text-3)", fontWeight:500, whiteSpace:"nowrap" }}>{lbl}</span>
              <input type="date" value={val} onChange={e=>fn(e.target.value)}
                style={{ width:"auto", padding:"6px 10px" }}/>
            </div>
          ))}

          {activeTab==="STALL" && (
            <button onClick={loadReport} disabled={loading} style={{
              padding:"8px 18px", background:"var(--c-gold)", color:"var(--c-bg)",
              border:"none", borderRadius:9, fontWeight:700, cursor:"pointer",
              fontSize:13, minHeight:"unset",
              boxShadow:"0 2px 12px rgba(200,132,42,0.3)",
            }}>
              {loading ? <Spin on/> : null} Load Report
            </button>
          )}

          {activeTab==="STALL" && summary && (
            <button onClick={loadReport} disabled={loading} title="Refresh" style={{
              width:34, height:34, borderRadius:9,
              border:"1px solid var(--c-border)", background:"transparent",
              color:"var(--c-text-3)", cursor:"pointer", fontSize:16, minHeight:"unset",
            }}><Spin on={loading}/></button>
          )}
        </div>
      )}

      {/* Stall report content */}
      {activeTab==="STALL" && (
        <div>
          {loading && (
            <div style={{ textAlign:"center", padding:"40px 0", color:"var(--c-text-4)" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🍫</div>
              <div style={{ fontSize:13 }}>Loading report…</div>
            </div>
          )}

          {summary && (
            <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
              <StatBox label="Total Bills"    value={summary.total_bills} color="var(--c-blue)"  bg="var(--c-blue-bg)"/>
              <StatBox label="Total Revenue"  value={`₹${Number(summary.total_revenue||0).toLocaleString("en-IN")}`} color="var(--c-green)" bg="var(--c-green-bg)"/>
              <StatBox label="Avg per Bill"   value={`₹${Number(summary.avg_bill||0).toFixed(0)}`} color="var(--c-gold)"  bg="var(--c-gold-dim)"/>
            </div>
          )}

          {candies.length>0 && <DataTable title="🍫 Candy Sales"     cols={["Candy","Qty Sold"]}   rows={candies.map(c=>[c.name,c.qty_sold])}/>}
          {combos.length>0  && <DataTable title="🎁 Combo Sales"     cols={["Combo","Sold","Price"]} rows={combos.map(c=>[c.title,c.sold,`₹${c.combo_price}`])}/>}
          {inventory.length>0 && (
            <div style={tCard}>
              <h3 style={tHead}>📦 Inventory Snapshot</h3>
              <table className="v-table">
                <thead><tr><th>Candy</th><th>Stock Remaining</th></tr></thead>
                <tbody>
                  {inventory.map((inv,i)=>(
                    <tr key={i}>
                      <td>{inv.name}</td>
                      <td style={{ fontWeight:700,
                        color: inv.stock===0 ? "var(--c-red)" : inv.stock<10 ? "var(--c-gold)" : "var(--c-green)"
                      }}>{inv.stock===0?"OUT":inv.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && summary && !candies.length && !combos.length && (
            <p style={{ color:"var(--c-text-4)", textAlign:"center", padding:"32px 0", fontSize:14 }}>
              No sales data for this period.
            </p>
          )}
        </div>
      )}

      {activeTab==="OVERALL" && <OverallReport startDate={startDate} endDate={endDate}/>}
      {activeTab==="BILLS"   && <Bills/>}
    </div>
  );
}

function DataTable({ title, cols, rows }) {
  return (
    <div style={tCard}>
      <h3 style={tHead}>{title}</h3>
      <table className="v-table">
        <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const tCard = { marginBottom:20, borderRadius:12, border:"1px solid var(--c-border)", overflow:"hidden", background:"var(--c-surface)" };
const tHead = { margin:0, padding:"14px 16px", borderBottom:"1px solid var(--c-border)", fontSize:"1rem", color:"var(--c-cream)" };
