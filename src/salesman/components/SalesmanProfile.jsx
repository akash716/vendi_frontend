import React, { useEffect, useState, useCallback } from "react";
import API_URL from "../../config";

const API = `${API_URL}/api/salesman`;
const fmt     = n  => Number(n||0).toLocaleString("en-IN");
const fmtDate = d  => new Date(d).toLocaleString("en-IN",{ day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });

function StatCard({ label, value, color, bg, border }) {
  return (
    <div style={{ background:bg, borderRadius:12, padding:"12px 14px", border:`1px solid ${border}` }}>
      <div style={{ fontSize:10, color, opacity:.7, marginBottom:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    </div>
  );
}

export default function SalesmanProfile({ stallId, onClose }) {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [startY,     setStartY]     = useState(null);
  const [translateY, setTranslateY] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/${stallId}/profile`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch(err) { alert("Failed: "+err.message); }
    finally { setLoading(false); }
  }, [stallId]);

  useEffect(() => { load(); }, [load]);

  /* Swipe down to close */
  const onTouchStart = e => setStartY(e.touches[0].clientY);
  const onTouchMove  = e => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) setTranslateY(dy);
  };
  const onTouchEnd   = () => {
    if (translateY > 90) { onClose(); }
    setTranslateY(0); setStartY(null);
  };

  const voidSale = async (saleId) => {
    if (!window.confirm(`Remove Bill #${saleId}? Inventory will be restored.`)) return;
    setDeletingId(saleId);
    try {
      const res  = await fetch(`${API}/${stallId}/sale/${saleId}`, { method:"DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await load();
    } catch(err) { alert("Failed: "+err.message); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:900 }}/>

      {/* Sheet */}
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:901,
          background:"var(--bg2)",
          borderRadius:"22px 22px 0 0",
          border:"1px solid var(--border1)",
          borderBottom:"none",
          maxHeight:"92vh", overflowY:"auto",
          boxShadow:"0 -16px 60px rgba(0,0,0,.6)",
          transform:`translateY(${translateY}px)`,
          transition: translateY===0 ? "transform .05s" : "none",
          animation: translateY===0 ? "sheetUp .3s cubic-bezier(.32,.72,0,1) forwards" : "none",
          WebkitOverflowScrolling:"touch",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ padding:"12px 0 8px", display:"flex", justifyContent:"center", cursor:"grab" }}>
          <div style={{ width:38, height:4, borderRadius:99, background:"var(--border2)" }}/>
        </div>

        {/* Close btn */}
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:16,
          background:"var(--bg5)", border:"1px solid var(--border1)",
          width:32, height:32, borderRadius:"50%",
          color:"var(--cream1)", fontSize:14, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:0, minHeight:"unset",
        }}>✕</button>

        <div style={{ padding:"4px 16px 40px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:"center", padding:"50px 0", color:"var(--cream0)" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🍫</div>
              <div style={{ fontSize:13 }}>Loading profile…</div>
            </div>
          )}

          {!loading && data && (() => {
            const { stall, today, allTime, recentBills } = data;
            return (
              <>
                {/* Avatar + name */}
                <div style={{ textAlign:"center", marginBottom:20, paddingTop:4 }}>
                  <div style={{
                    width:62, height:62, borderRadius:"50%",
                    background:"linear-gradient(135deg,var(--gold2),var(--gold3))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:26, margin:"0 auto 10px",
                    boxShadow:"0 4px 20px rgba(200,132,42,.4)",
                  }}>👤</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:22, color:"var(--cream4)" }}>
                    {stall.salesman_name || stall.name}
                  </div>
                  <div style={{ fontSize:11, color:"var(--cream0)", marginTop:4, display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                    {stall.company && <span>🏢 {stall.company}</span>}
                    <span>🏪 {stall.name}</span>
                    <span>#ID {stall.id}</span>
                  </div>
                </div>

                <div style={{ height:1, background:"var(--border0)", margin:"0 0 16px" }}/>

                {/* Today */}
                <div style={{ marginBottom:16 }}>
                  <div style={secLabel}>📅 Today</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <StatCard label="Revenue" value={`₹${fmt(today.revenue)}`} color="var(--green)" bg="var(--green-bg)" border="var(--green-border)"/>
                    <StatCard label="Bills"   value={today.bills} color="var(--blue)" bg="var(--blue-bg)" border="var(--blue-border)"/>
                  </div>
                </div>

                {/* All time */}
                <div style={{ marginBottom:16 }}>
                  <div style={secLabel}>🏆 All Time</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <StatCard label="Revenue" value={`₹${fmt(allTime.revenue)}`} color="var(--gold3)" bg="var(--bg5)" border="var(--border2)"/>
                    <StatCard label="Bills"   value={allTime.bills} color="var(--c-purple)" bg="var(--c-purple-bg)" border="#4a1a6a"/>
                  </div>
                </div>

                <div style={{ height:1, background:"var(--border0)", margin:"0 0 14px" }}/>

                {/* Recent bills */}
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={secLabel}>🧾 Recent Bills</div>
                    <button onClick={load} style={{ background:"none", border:"none", color:"var(--cream0)", fontSize:13, cursor:"pointer", padding:0, minHeight:"unset" }}>
                      ↻ Refresh
                    </button>
                  </div>

                  {recentBills.length===0 ? (
                    <p style={{ color:"var(--cream0)", textAlign:"center", fontSize:13, padding:"16px 0" }}>No sales yet</p>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {recentBills.map(bill => (
                        <div key={bill.id} style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"11px 13px", borderRadius:12,
                          background:"var(--bg3)", border:"1px solid var(--border0)",
                        }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:"var(--cream4)" }}>
                              Bill #{bill.id}
                            </div>
                            <div style={{ fontSize:11, color:"var(--cream0)", marginTop:2 }}>
                              {fmtDate(bill.created_at)}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ fontWeight:800, fontSize:15, color:"var(--green)" }}>
                              ₹{fmt(bill.total)}
                            </div>
                            <button onClick={() => voidSale(bill.id)} disabled={deletingId===bill.id}
                              style={{
                                padding:"5px 10px", borderRadius:8, border:"none", minHeight:"unset",
                                background: deletingId===bill.id ? "var(--bg5)" : "var(--red-bg)",
                                color: deletingId===bill.id ? "var(--cream0)" : "var(--red)",
                                cursor: deletingId===bill.id ? "wait" : "pointer",
                                fontWeight:700, fontSize:11,
                              }}>
                              {deletingId===bill.id ? "…" : "✕ Void"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}

const secLabel = {
  fontSize:10, fontWeight:700, color:"var(--cream1)",
  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10,
};
