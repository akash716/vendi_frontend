import React from "react";

export default function ComboSizePopup({ visible, comboSizes=[], onSelect, onCancel }) {
  if (!visible) return null;
  return (
    <>
      <style>{`@keyframes popIn { from { opacity:0; transform:scale(.92) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"0 20px" }}>
        <div style={{
          background:"var(--bg3)", border:"1px solid var(--border2)",
          padding:"24px 20px", borderRadius:20, width:"100%", maxWidth:320,
          boxShadow:"0 24px 60px rgba(0,0,0,.6)",
          animation:"popIn .22s ease",
        }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🎁</div>
            <h3 style={{ margin:"0 0 5px", fontSize:"1.2rem", color:"var(--cream4)" }}>Select Combo Size</h3>
            <p style={{ fontSize:12, color:"var(--cream1)", margin:0 }}>How many chocolates?</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:12 }}>
            {comboSizes.map(size => (
              <button key={size} onClick={() => onSelect(size)} style={{
                padding:"13px", borderRadius:12,
                border:"1px solid var(--gold2)",
                background:"linear-gradient(135deg,var(--gold2),var(--gold3))",
                color:"var(--bg0)", fontWeight:800, fontSize:15, cursor:"pointer",
                boxShadow:"0 3px 12px rgba(200,132,42,.3)",
                minHeight:"unset", letterSpacing:"0.02em",
              }}>
                {size} Chocolate Combo
              </button>
            ))}
          </div>

          <button onClick={onCancel} style={{
            width:"100%", padding:"11px", borderRadius:12,
            border:"1px solid var(--border1)", background:"transparent",
            color:"var(--cream1)", fontWeight:600, fontSize:13, cursor:"pointer", minHeight:"unset",
          }}>Cancel</button>
        </div>
      </div>
    </>
  );
}
