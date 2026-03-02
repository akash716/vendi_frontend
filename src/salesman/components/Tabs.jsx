import React from "react";

const TABS = [
  { key:"SINGLE",    label:"Singles",    icon:"🍫" },
  { key:"COMBO",     label:"Combos",     icon:"🎁" },
  { key:"BIG_COMBO", label:"Big Combos", icon:"✨" },
];

export default function Tabs({ active, onChange }) {
  return (
    <div style={{
      display:"flex", gap:5, marginBottom:14,
      background:"var(--bg0)", padding:5,
      borderRadius:13, border:"1px solid var(--border0)",
    }}>
      {TABS.map(t => {
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            flex:1, padding:"8px 6px", borderRadius:10, border:"none",
            background: on ? "linear-gradient(135deg,var(--gold2),var(--gold3))" : "transparent",
            color: on ? "var(--bg0)" : "var(--cream1)",
            fontWeight: on ? 700 : 500,
            fontSize:12, cursor:"pointer",
            transition:"all .18s ease",
            display:"flex", alignItems:"center", justifyContent:"center", gap:4,
            boxShadow: on ? "0 2px 12px rgba(200,132,42,.35)" : "none",
            minHeight:42, WebkitTapHighlightColor:"transparent",
          }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
