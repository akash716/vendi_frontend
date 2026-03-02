import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const MENU = [
  { path:"/admin",              label:"Dashboard",   icon:"◈",  end:true },
  { path:"/admin/stalls",       label:"Stalls",      icon:"🏪" },
  { path:"/admin/candies",      label:"Candies",     icon:"🍫" },
  { path:"/admin/candy-lists",  label:"Candy Lists", icon:"📋" },
  { path:"/admin/offers",       label:"Offers",      icon:"🎁" },
  { path:"/admin/inventory",    label:"Inventory",   icon:"📦" },
  { path:"/admin/reports",      label:"Reports",     icon:"📊" },
  { path:"/admin/events",       label:"Events",      icon:"📅" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed?" collapsed":""}`}>
      {/* ── Brand ── */}
      <div style={{
        padding: collapsed?"18px 0":"20px 16px 16px",
        borderBottom:"1px solid var(--border0)",
        display:"flex", alignItems:"center",
        justifyContent: collapsed?"center":"space-between",
        gap:8, flexShrink:0,
      }}>
        {!collapsed && (
          <div>
            <div style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontWeight:700, fontSize:21,
              color:"var(--cream4)",
              letterSpacing:"0.04em", lineHeight:1,
            }}>Vendi</div>
            <div style={{
              fontSize:9.5, color:"var(--cream0)",
              fontWeight:600, marginTop:4,
              letterSpacing:"0.12em", textTransform:"uppercase",
            }}>Chocolates · Admin</div>
          </div>
        )}
        <button
          onClick={()=>setCollapsed(c=>!c)}
          style={{
            width:26, height:26, borderRadius:7, border:"1px solid var(--border1)",
            background:"var(--bg5)", color:"var(--gold2)",
            fontSize:12, cursor:"pointer", padding:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0, minHeight:"unset",
            transition:"background 0.15s",
          }}
        >
          {collapsed?"›":"‹"}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex:1, padding:"8px 6px", overflowY:"auto" }}>
        {MENU.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            style={({isActive})=>({
              display:"flex", alignItems:"center",
              gap:10,
              padding: collapsed?"10px 0":"8px 11px",
              marginBottom:2, borderRadius:9,
              justifyContent: collapsed?"center":"flex-start",
              background: isActive
                ? "linear-gradient(90deg,rgba(200,132,42,.22),rgba(200,132,42,.06))"
                : "transparent",
              borderLeft: isActive?"2.5px solid var(--gold2)":"2.5px solid transparent",
              color: isActive ? "var(--gold3)" : "var(--cream1)",
              textDecoration:"none",
              fontWeight: isActive?600:400,
              fontSize:13,
              transition:"all .15s",
              whiteSpace:"nowrap", overflow:"hidden",
            })}
            onMouseEnter={e=>{
              if(!e.currentTarget.style.borderLeft.includes("gold"))
                e.currentTarget.style.background="var(--bg5)";
            }}
            onMouseLeave={e=>{
              const isActive = e.currentTarget.getAttribute("aria-current")==="page";
              if(!isActive) e.currentTarget.style.background="transparent";
            }}
          >
            <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      {!collapsed && (
        <div style={{
          padding:"12px 16px", borderTop:"1px solid var(--border0)",
          fontSize:10, color:"var(--cream0)",
          letterSpacing:"0.08em", textTransform:"uppercase",
        }}>
          🍫 Vendi POS · v2.0
        </div>
      )}
    </aside>
  );
}
