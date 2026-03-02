import React, { useEffect, useState, useMemo } from "react";
import API_URL from "../../config";

const API = API_URL;

export default function Cart({ cart, setCart, stallId, onSaleComplete }) {
  const [finalTotal, setFinalTotal] = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    const preview = async () => {
      if (!cart.length) { setFinalTotal(null); return; }
      try {
        const res  = await fetch(`${API}/api/salesman/preview`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ lines:cart, stallId }) });
        const data = await res.json();
        setFinalTotal(Number(data.total || 0));
      } catch { setFinalTotal(null); }
    };
    preview();
  }, [cart, stallId]);

  const comboNames = useMemo(() => {
    const s = new Set();
    cart.forEach(l => { if (l.type==="COMBO") l.items?.forEach(it => it?.name && s.add(it.name)); });
    return s;
  }, [cart]);

  const removeLine = i => setCart(prev => prev.filter((_,j)=>j!==i));

  const checkout = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/salesman/${stallId}/sell`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ lines:cart }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sale failed");
      alert(`Sale completed! Bill: ₹${finalTotal?.toFixed(2)}`);
      setCart([]); onSaleComplete?.();
    } catch(e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", background:"var(--bg2)", border:"1px solid var(--border1)", borderRadius:16, overflow:"hidden", maxHeight:"80vh" }}>

      {/* Header */}
      <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border0)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🛒</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:16, color:"var(--cream4)" }}>Cart</span>
        </div>
        {cart.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:"var(--gold2)", color:"var(--bg0)", width:20, height:20, borderRadius:"50%", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {cart.reduce((s,l)=>s+(l.items?.length||1),0)}
            </span>
            <button onClick={() => setCart([])} style={{ background:"transparent", border:"none", color:"var(--cream1)", fontSize:11, cursor:"pointer", minHeight:"unset", padding:0, textDecoration:"underline" }}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Items list */}
      <div style={{ flex:1, overflowY:"auto", padding:"10px 12px" }}>
        {cart.length===0 && (
          <div style={{ textAlign:"center", padding:"30px 0", color:"var(--cream0)" }}>
            <div style={{ fontSize:30, marginBottom:8 }}>🍫</div>
            <div style={{ fontSize:12, fontWeight:500 }}>Cart is empty</div>
            <div style={{ fontSize:11, marginTop:4, color:"var(--border2)" }}>Select items to get started</div>
          </div>
        )}

        {cart.map((l,i) => {
          if (l.type==="COMBO") return (
            <div key={`combo-${i}`} style={{ marginBottom:8, padding:"9px 12px", borderRadius:10, background:"var(--green-bg)", border:"1px solid var(--green-border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:13 }}>🎁</span>
                  <span style={{ fontWeight:700, fontSize:13, color:"var(--green)" }}>Combo Deal</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontWeight:800, fontSize:14, color:"var(--green)" }}>₹{Number(l.price).toFixed(0)}</span>
                  <button onClick={()=>removeLine(i)} style={{ background:"transparent", border:"none", color:"var(--red)", fontSize:14, cursor:"pointer", padding:0, minHeight:"unset" }}>✕</button>
                </div>
              </div>
              <div style={{ marginTop:5, paddingLeft:2 }}>
                {l.items?.map((it,j)=><div key={j} style={{ fontSize:11, color:"var(--green)", opacity:.8, lineHeight:1.6 }}>· {it.name}</div>)}
              </div>
            </div>
          );

          if (l.type==="ITEM" && !comboNames.has(l.items?.[0]?.name)) {
            const it = l.items?.[0];
            return (
              <div key={`item-${i}`} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", marginBottom:6, borderRadius:9, background:"var(--bg4)", border:"1px solid var(--border0)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold2)", flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:"var(--cream4)", fontWeight:500 }}>{it?.name}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:"var(--gold3)" }}>₹{Number(it?.price).toFixed(0)}</span>
                  <button onClick={()=>removeLine(i)} style={{ background:"transparent", border:"none", color:"var(--cream1)", fontSize:14, cursor:"pointer", padding:0, minHeight:"unset" }}>✕</button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:"12px 14px", borderTop:"1px solid var(--border0)", flexShrink:0, background:"var(--bg2)" }}>
        {finalTotal !== null && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"10px 12px", background:"var(--bg4)", borderRadius:10, border:"1px solid var(--border1)" }}>
            <span style={{ fontSize:13, color:"var(--cream2)", fontWeight:500 }}>Total</span>
            <span style={{ fontFamily:"'',serif", fontSize:22, fontWeight:700, color:"var(--cream4)" }}>₹{finalTotal.toFixed(2)}</span>
          </div>
        )}
        <button onClick={checkout} disabled={!cart.length || loading} style={{
          width:"100%", padding:"13px",
          borderRadius:12, border:"none",
          background: cart.length ? "linear-gradient(135deg,var(--gold2),var(--gold3))" : "var(--bg5)",
          color: cart.length ? "var(--bg0)" : "var(--cream0)",
          fontWeight:800, fontSize:15,
          cursor: cart.length ? "pointer" : "not-allowed",
          letterSpacing:"0.04em",
          boxShadow: cart.length ? "0 4px 18px rgba(200,132,42,.38)" : "none",
          transition:"all .18s",
        }}>
          {loading ? "PROCESSING…" : "CHECKOUT"}
        </button>
      </div>
    </div>
  );
}
