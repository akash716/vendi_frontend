import React, { useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import API_URL from "../../../config";

const API = `${API_URL}/api/admin/reports`;

const fmtDate    = d => d.toISOString().slice(0,10);
const today      = () => fmtDate(new Date());
const daysAgo    = n => { const d=new Date(); d.setDate(d.getDate()-n); return fmtDate(d); };
const monthStart = () => { const d=new Date(); d.setDate(1); return fmtDate(d); };
const SHORTCUTS  = [
  { label:"Today",      fn:()=>[today(),today()] },
  { label:"Yesterday",  fn:()=>[daysAgo(1),daysAgo(1)] },
  { label:"This Week",  fn:()=>[daysAgo(6),today()] },
  { label:"This Month", fn:()=>[monthStart(),today()] },
];

function Spin({ on }) {
  return <span style={{ display:"inline-block", animation:on?"spin 0.8s linear infinite":"none" }}>↻</span>;
}

function StatPill({ label, value, color, bg }) {
  return (
    <div style={{ flex:"1 1 120px", padding:"10px 14px", borderRadius:11, background:bg, border:`1px solid ${color}22` }}>
      <div style={{ fontSize:9.5, color, opacity:.7, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

export default function Bills() {
  const [startDate,    setStartDate]    = useState(today());
  const [endDate,      setEndDate]      = useState(today());
  const [bills,        setBills]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [shortcut,     setShortcut]     = useState("Today");
  const [modalBill,    setModalBill]    = useState(null);
  const [modalItems,   setModalItems]   = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const applyShortcut = s => { const [a,b]=s.fn(); setStartDate(a); setEndDate(b); setShortcut(s.label); };

  const loadBills = async () => {
    setLoading(true); setModalBill(null);
    try {
      const res  = await adminFetch(`${API}/bills?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setBills(Array.isArray(data)?data:[]);
    } catch(err) { alert("Failed: "+err.message); }
    finally { setLoading(false); }
  };

  const openModal = async bill => {
    setModalBill(bill); setModalItems([]); setModalLoading(true);
    try {
      const res  = await adminFetch(`${API}/bills/${bill.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setModalItems(Array.isArray(data)?data:[]);
    } catch(err) { alert("Failed: "+err.message); }
    finally { setModalLoading(false); }
  };

  const deleteBill = async bill => {
    if (!window.confirm(`Delete Bill #${bill.id}?\n\nInventory will be restored. Cannot be undone.`)) return;
    try {
      const res  = await adminFetch(`${API}/bills/${bill.id}`, {method:"DELETE"});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Failed");
      setBills(prev=>prev.filter(b=>b.id!==bill.id));
      if (modalBill?.id===bill.id) setModalBill(null);
    } catch(err) { alert("Delete failed: "+err.message); }
  };

  const totalRevenue = bills.reduce((s,b)=>s+Number(b.total||0),0);
  const fmtDT = dt => new Date(dt).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
  const fmtDTLong = dt => new Date(dt).toLocaleString("en-IN",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"});

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        /* Bills — mobile card layout vs desktop table */
        .bills-table { display:block }
        .bills-cards { display:none }
        @media(max-width:640px){
          .bills-table  { display:none !important }
          .bills-cards  { display:flex !important; flex-direction:column; gap:10px }
          .bills-filter { flex-direction:column !important; align-items:stretch !important }
          .bills-shortcuts { flex-wrap:wrap }
          .bills-dates { flex-direction:column !important; gap:8px !important }
        }
      `}</style>

      {/* ── Filter bar ── */}
      <div className="bills-filter" style={{ display:"flex", gap:10, padding:"12px 14px", borderRadius:12, border:"1px solid var(--border1)", marginBottom:16, flexWrap:"wrap", alignItems:"center", background:"var(--bg3)" }}>
        {/* Shortcuts */}
        <div className="bills-shortcuts" style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {SHORTCUTS.map(s=>(
            <button key={s.label} onClick={()=>applyShortcut(s)} style={{
              padding:"5px 11px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", minHeight:"unset",
              background: shortcut===s.label ? "var(--gold2)" : "transparent",
              color:      shortcut===s.label ? "var(--bg0)"   : "var(--cream1)",
              border:     `1px solid ${shortcut===s.label ? "var(--gold2)" : "var(--border1)"}`,
            }}>{s.label}</button>
          ))}
        </div>
        {/* Date inputs */}
        <div className="bills-dates" style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {[["From",startDate,v=>{setStartDate(v);setShortcut("");}],["To",endDate,v=>{setEndDate(v);setShortcut("");}]].map(([lbl,val,fn])=>(
            <div key={lbl} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11, color:"var(--cream1)", fontWeight:600, minWidth:22 }}>{lbl}</span>
              <input type="date" value={val} onChange={e=>fn(e.target.value)} style={{ width:"auto", padding:"6px 10px", fontSize:13 }}/>
            </div>
          ))}
        </div>
        <button onClick={loadBills} disabled={loading} style={{ padding:"8px 18px", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", color:"var(--bg0)", border:"none", borderRadius:9, fontWeight:700, cursor:"pointer", fontSize:13, minHeight:"unset", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
          {loading && <Spin on/>} Load Bills
        </button>
      </div>

      {/* ── Summary pills ── */}
      {bills.length>0 && (
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <StatPill label="Bills"    value={bills.length}                             color="var(--blue)"  bg="var(--blue-bg)"/>
          <StatPill label="Revenue"  value={`₹${totalRevenue.toLocaleString("en-IN")}`} color="var(--green)" bg="var(--green-bg)"/>
          <StatPill label="Avg Bill" value={`₹${(totalRevenue/bills.length).toFixed(0)}`} color="var(--gold3)" bg="var(--bg5)"/>
        </div>
      )}

      {/* Loading / empty */}
      {loading && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--cream0)" }}>
          <div style={{ fontSize:28 }}>🍫</div>
          <div style={{ fontSize:13, marginTop:6 }}>Loading bills…</div>
        </div>
      )}
      {!loading && bills.length===0 && (
        <p style={{ color:"var(--cream0)", textAlign:"center", padding:"32px 0", fontSize:13 }}>Select a date range and click "Load Bills".</p>
      )}

      {/* ── Desktop table ── */}
      {bills.length>0 && (
        <div className="bills-table" style={{ borderRadius:12, border:"1px solid var(--border1)", overflow:"hidden", background:"var(--bg3)" }}>
          <div style={{ overflowX:"auto" }}>
            <table className="v-table" style={{ minWidth:500 }}>
              <thead>
                <tr><th>Bill #</th><th>Stall</th><th>Company</th><th>Date</th><th>Total</th><th style={{textAlign:"center"}}>Actions</th></tr>
              </thead>
              <tbody>
                {bills.map(b=>(
                  <tr key={b.id}>
                    <td style={{ fontWeight:700, color:"var(--gold3)" }}>#{b.id}</td>
                    <td style={{ fontWeight:500 }}>{b.stall}</td>
                    <td style={{ color:"var(--cream1)", fontSize:12 }}>{b.company||"—"}</td>
                    <td style={{ color:"var(--cream1)", fontSize:12 }}>{fmtDT(b.created_at)}</td>
                    <td style={{ fontWeight:800, color:"var(--green)" }}>₹{Number(b.total).toFixed(2)}</td>
                    <td>
                      <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                        <button onClick={()=>openModal(b)}  style={eyeBtn} title="View">👁</button>
                        <button onClick={()=>deleteBill(b)} style={delBtn} title="Delete">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Mobile cards ── */}
      {bills.length>0 && (
        <div className="bills-cards">
          {bills.map(b=>(
            <div key={b.id} style={{ background:"var(--bg3)", border:"1px solid var(--border1)", borderRadius:13, padding:"12px 13px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--gold3)" }}>Bill #{b.id}</div>
                  <div style={{ fontSize:12, color:"var(--cream2)", marginTop:2 }}>{b.stall}{b.company?` · ${b.company}`:""}</div>
                  <div style={{ fontSize:11, color:"var(--cream0)", marginTop:2 }}>{fmtDT(b.created_at)}</div>
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:800, color:"var(--green)" }}>
                  ₹{Number(b.total).toFixed(2)}
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>openModal(b)} style={{ ...eyeBtn, flex:1, padding:"7px", fontSize:13, borderRadius:9 }}>👁 View</button>
                <button onClick={()=>deleteBill(b)} style={{ ...delBtn, flex:1, padding:"7px", borderRadius:9 }}>✕ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bill detail modal ── */}
      {modalBill && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}
          onClick={()=>setModalBill(null)}>
          <div style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:"18px 18px 0 0", padding:"0 0 32px", width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 -16px 50px rgba(0,0,0,.6)" }}
            onClick={e=>e.stopPropagation()}>

            {/* Handle */}
            <div style={{ padding:"12px 0 0", display:"flex", justifyContent:"center" }}>
              <div style={{ width:36, height:4, borderRadius:99, background:"var(--border2)" }}/>
            </div>

            {/* Bill header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"14px 16px 0" }}>
              <div>
                <h3 style={{ margin:"0 0 3px", fontSize:"1.1rem" }}>Bill #{modalBill.id}</h3>
                <div style={{ color:"var(--cream2)", fontSize:12 }}>{modalBill.stall}{modalBill.company?` · ${modalBill.company}`:""}</div>
                <div style={{ color:"var(--cream0)", fontSize:11, marginTop:2 }}>{fmtDTLong(modalBill.created_at)}</div>
              </div>
              <button onClick={()=>setModalBill(null)} style={{ background:"var(--bg5)", border:"1px solid var(--border1)", width:30, height:30, borderRadius:8, color:"var(--cream1)", fontSize:14, cursor:"pointer", minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>
            </div>

            <div style={{ height:1, background:"var(--border0)", margin:"12px 0" }}/>

            <div style={{ padding:"0 16px" }}>
              {modalLoading && <p style={{ color:"var(--cream0)", textAlign:"center", padding:"20px 0" }}>Loading…</p>}
              {!modalLoading && modalItems.length===0 && <p style={{ color:"var(--cream0)", textAlign:"center" }}>No items found.</p>}

              {!modalLoading && modalItems.length>0 && (
                <>
                  {/* Mobile-friendly item list (not a table) */}
                  <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
                    {modalItems.map((it,idx)=>(
                      <div key={idx} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", borderRadius:10, background:"var(--bg4)", border:"1px solid var(--border0)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
                          <span style={{ padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:700, background:it.type==="COMBO"?"var(--blue-bg)":"var(--bg5)", color:it.type==="COMBO"?"var(--blue)":"var(--cream1)", whiteSpace:"nowrap", flexShrink:0 }}>
                            {it.type==="COMBO"?"🎁":"🍫"}
                          </span>
                          <span style={{ fontSize:13, color:"var(--cream3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{it.candy_name||"—"}</span>
                          <span style={{ fontSize:11, color:"var(--cream0)", flexShrink:0 }}>×{it.qty}</span>
                        </div>
                        <span style={{ fontWeight:700, color:"var(--gold3)", fontSize:14, marginLeft:10, flexShrink:0 }}>₹{Number(it.display_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:11, background:"var(--bg2)", border:"1px solid var(--border1)", marginBottom:14 }}>
                    <span style={{ fontWeight:600, color:"var(--cream2)" }}>Total</span>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:24, color:"var(--green)" }}>₹{Number(modalBill.total).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>deleteBill(modalBill)} style={{ ...delBtn, flex:1, padding:"10px", borderRadius:10, fontSize:13 }}>
                  ✕ Void Bill
                </button>
                <button onClick={()=>setModalBill(null)} style={{ flex:2, padding:"10px", background:"var(--bg5)", color:"var(--cream2)", border:"1px solid var(--border1)", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:13, minHeight:"unset" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const eyeBtn = { width:32, height:32, borderRadius:8, border:"1px solid var(--border1)", background:"var(--bg5)", color:"var(--cream2)", cursor:"pointer", fontSize:14, minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center" };
const delBtn = { display:"flex", alignItems:"center", justifyContent:"center", background:"var(--red-bg)", color:"var(--red)", border:"1px solid var(--red-border)", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:12, minHeight:"unset", padding:"6px 10px", gap:4 };
