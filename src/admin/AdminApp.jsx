import React, { useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

import Dashboard    from "./pages/Dashboard";
import Stalls       from "./pages/Stalls";
import Offers       from "./pages/Offer";
import Candies      from "./pages/Candies";
import Inventory    from "./pages/Inventory";
import Reports      from "./pages/Reports/Reports";
import StallManager from "./pages/StallManager";
import CandyLists   from "./pages/CandyLists";
import CandyListManage from "./pages/CandyListManage";
import OfferLists   from "./pages/OfferLists";
import OfferListManage from "./pages/OfferListManage";

const MENU = [
  { path:"/admin",             label:"Dashboard",   icon:"◈",  end:true },
  { path:"/admin/stalls",      label:"Stalls",      icon:"🏪" },
  { path:"/admin/candies",     label:"Chocolates",     icon:"🍫" },
  { path:"/admin/candy-lists", label:"Price Lists", icon:"📋" },
  { path:"/admin/offers",      label:"Offers",      icon:"🎁" },
  { path:"/admin/inventory",   label:"Inventory",   icon:"📦" },
  { path:"/admin/reports",     label:"Reports",     icon:"📊" },
];

const PAGES = {
  "/admin":             ["Dashboard",   "Your operations at a glance"],
  "/admin/stalls":      ["Stalls",      "Manage stalls & salesmen"],
  "/admin/candies":     ["Candy Master","Products & categories"],
  "/admin/candy-lists": ["Candy Lists", "Event-based pricing"],
  "/admin/offers":      ["Offers",      "Combo deals & discounts"],
  "/admin/inventory":   ["Inventory",   "Stock levels per stall"],
  "/admin/reports":     ["Reports",     "Sales analytics & billing"],
};

/* ── Shared NavLink style ── */
function navStyle(isActive, compact) {
  return {
    display:"flex", alignItems:"center",
    gap: compact ? 0 : 10,
    padding: compact ? "10px 0" : "9px 11px",
    marginBottom:2, borderRadius:9,
    justifyContent: compact ? "center" : "flex-start",
    background: isActive ? "linear-gradient(90deg,rgba(200,132,42,.22),rgba(200,132,42,.06))" : "transparent",
    borderLeft: isActive ? "2.5px solid var(--gold2)" : "2.5px solid transparent",
    color: isActive ? "var(--gold3)" : "var(--cream1)",
    textDecoration:"none", fontWeight: isActive ? 600 : 400,
    fontSize:13, transition:"all .15s", whiteSpace:"nowrap", overflow:"hidden",
  };
}

/* ─── Desktop Sidebar ─── */
function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside style={{
      width: collapsed ? 56 : 218, flexShrink:0,
      background:"var(--bg2)", borderRight:"1px solid var(--border0)",
      display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0,
      overflow:"hidden", transition:"width .22s cubic-bezier(.4,0,.2,1)", zIndex:100,
    }}>
      <div style={{ padding: collapsed ? "16px 0" : "18px 14px 14px", borderBottom:"1px solid var(--border0)", display:"flex", alignItems:"center", justifyContent: collapsed ? "center" : "space-between", gap:8, flexShrink:0 }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"var(--cream4)", letterSpacing:"0.04em", lineHeight:1 }}>Vendi</div>
            <div style={{ fontSize:9, color:"var(--cream0)", fontWeight:600, marginTop:3, letterSpacing:"0.12em", textTransform:"uppercase" }}>Chocolates · Admin</div>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{ width:26, height:26, borderRadius:7, border:"1px solid var(--border1)", background:"var(--bg5)", color:"var(--gold2)", fontSize:11, cursor:"pointer", padding:0, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, minHeight:"unset" }}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav style={{ flex:1, padding:"8px 5px", overflowY:"auto" }}>
        {MENU.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end} style={({ isActive }) => navStyle(isActive, collapsed)}>
            <span style={{ fontSize:15, flexShrink:0, width: collapsed ? "auto" : 20, textAlign:"center" }}>{item.icon}</span>
            {!collapsed && <span style={{ marginLeft:2 }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border0)", fontSize:9.5, color:"var(--cream0)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
          🍫 Vendi POS · v2.0
        </div>
      )}
    </aside>
  );
}

/* ─── Mobile Drawer ─── */
function MobileDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:300 }} />
      <div style={{ position:"fixed", left:0, top:0, bottom:0, width:230, background:"var(--bg2)", borderRight:"1px solid var(--border1)", zIndex:301, display:"flex", flexDirection:"column", animation:"slideRight .2s ease" }}>
        <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid var(--border0)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:21, color:"var(--cream4)", letterSpacing:"0.04em" }}>Vendi</div>
            <div style={{ fontSize:9, color:"var(--cream0)", fontWeight:600, marginTop:3, letterSpacing:"0.1em", textTransform:"uppercase" }}>Chocolates · Admin</div>
          </div>
          <button onClick={onClose} style={{ background:"var(--bg5)", border:"1px solid var(--border1)", width:30, height:30, borderRadius:8, color:"var(--cream2)", fontSize:15, cursor:"pointer", minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {MENU.map(item => (
            <NavLink key={item.path} to={item.path} end={item.end} onClick={onClose}
              style={({ isActive }) => ({
                display:"flex", alignItems:"center", gap:12,
                padding:"12px 11px", marginBottom:2, borderRadius:10,
                background: isActive ? "linear-gradient(90deg,rgba(200,132,42,.22),rgba(200,132,42,.06))" : "transparent",
                borderLeft: isActive ? "3px solid var(--gold2)" : "3px solid transparent",
                color: isActive ? "var(--gold3)" : "var(--cream2)",
                textDecoration:"none", fontWeight: isActive ? 600 : 400, fontSize:14,
              })}
            >
              <span style={{ fontSize:17 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding:"12px 14px", borderTop:"1px solid var(--border0)", fontSize:10, color:"var(--cream0)" }}>🍫 Vendi POS · v2.0</div>
      </div>
    </>
  );
}

/* ─── Header ─── */
function AdminHeader({ onMenuOpen }) {
  const { pathname } = useLocation();
  const { admin, logout } = useAuth();
  const entry = Object.entries(PAGES).find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  const [title, sub] = entry?.[1] || ["Admin",""];
  return (
    <header style={{ background:"var(--bg2)", borderBottom:"1px solid var(--border0)", padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onMenuOpen} id="mob-burger" style={{ display:"none", background:"var(--bg5)", border:"1px solid var(--border1)", width:34, height:34, borderRadius:9, color:"var(--cream2)", fontSize:17, cursor:"pointer", minHeight:"unset", alignItems:"center", justifyContent:"center", flexShrink:0 }}>☰</button>
        <div>
          <h2 style={{ margin:0, fontSize:"1rem", fontWeight:600, color:"var(--cream4)" }}>{title}</h2>
          {sub && <p style={{ margin:"1px 0 0", fontSize:10.5, color:"var(--cream0)" }}>{sub}</p>}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {admin && (
          <span style={{ fontSize:11, color:"var(--cream1)", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--bg0)", fontWeight:800, flexShrink:0 }}>
              {admin.name?.[0]?.toUpperCase() || "A"}
            </span>
            <span style={{ display:"none" }} className="admin-name-label">{admin.name}</span>
          </span>
        )}
        <div style={{ background:"var(--c-gold-dim)", border:"1px solid rgba(200,132,42,.18)", color:"var(--gold3)", padding:"4px 11px", borderRadius:99, fontSize:10.5, fontWeight:600, whiteSpace:"nowrap" }}>
          🍫 Vendi Admin
        </div>
        <button onClick={logout} title="Logout" style={{ width:32, height:32, borderRadius:9, background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", fontSize:14, cursor:"pointer", minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center" }}>
          ⏻
        </button>
      </div>
    </header>
  );
}

/* ─── App ─── */
export default function AdminApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg1)", width:"100%" }}>
      <style>{`
        @keyframes slideRight { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @media (max-width:768px) {
          .adm-sidebar { display:none !important; }
          #mob-burger   { display:flex !important; }
          .adm-content  { padding:12px !important; }
        }
      `}</style>

      <div className="adm-sidebar"><DesktopSidebar /></div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        <AdminHeader onMenuOpen={() => setDrawerOpen(true)} />
        <main className="adm-content" style={{ flex:1, padding:"22px 26px" }}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/stalls"        element={<Stalls />} />
            <Route path="/offers"        element={<Offers />} />
            <Route path="/candies"       element={<Candies />} />
            <Route path="/inventory"     element={<Inventory />} />
            <Route path="/reports"       element={<Reports />} />
            <Route path="/stalls/:stallId"    element={<StallManager />} />
            <Route path="/candy-lists"        element={<CandyLists />} />
            <Route path="/candy-lists/:id"    element={<CandyListManage />} />
            <Route path="/admin/offer-lists"      element={<OfferLists />} />
            <Route path="/admin/offer-lists/:id"  element={<OfferListManage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
