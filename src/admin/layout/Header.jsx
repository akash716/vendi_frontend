import React from "react";
import { useLocation } from "react-router-dom";

const PAGES = {
  "/admin":             ["Dashboard",   "Your operations at a glance"],
  "/admin/stalls":      ["Stalls",       "Manage stalls & salesmen"],
  "/admin/candies":     ["Candy Master", "Products & categories"],
  "/admin/candy-lists": ["Candy Lists",  "Event-based pricing"],
  "/admin/offers":      ["Offers",       "Combo deals & discounts"],
  "/admin/inventory":   ["Inventory",    "Stock levels per stall"],
  "/admin/reports":     ["Reports",      "Sales analytics & billing"],
  "/admin/events":      ["Events",       "Events & assignments"],
};

export default function Header() {
  const { pathname } = useLocation();
  const entry = Object.entries(PAGES).find(([p])=>pathname===p||pathname.startsWith(p+"/"));
  const [title, sub] = entry?.[1] || ["Admin",""];

  return (
    <header className="admin-header">
      <div>
        <h2 style={{ margin:0, fontSize:"1.1rem", fontWeight:600, letterSpacing:"-0.01em" }}>
          {title}
        </h2>
        {sub && (
          <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--cream0)", fontWeight:400, letterSpacing:"0.02em" }}>
            {sub}
          </p>
        )}
      </div>

      <div style={{
        display:"flex", alignItems:"center", gap:10,
        background:"var(--c-gold-dim)", border:"1px solid rgba(200,132,42,.2)",
        color:"var(--gold3)", padding:"5px 14px", borderRadius:99,
        fontSize:11, fontWeight:600, letterSpacing:"0.05em",
      }}>
        🍫 Vendi Admin
      </div>
    </header>
  );
}
