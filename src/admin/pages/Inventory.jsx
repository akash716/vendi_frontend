import React, { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import API_URL from "../../config";

const API = `${API_URL}/api/admin`;

export default function Inventory() {
  const [stalls,    setStalls]    = useState([]);
  const [stallId,   setStallId]   = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    adminFetch(`${API}/stalls`).then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : [];
      setStalls(list);
      if (list.length) setStallId(String(list[0].id));
    });
  }, []);

  useEffect(() => {
    if (!stallId) return;
    setLoading(true);
    adminFetch(`${API}/inventory/${stallId}`)
      .then(r => r.json())
      .then(d => setInventory(Array.isArray(d) ? d : []))
      .catch(() => setInventory([]))
      .finally(() => setLoading(false));
  }, [stallId]);

  const filtered = inventory.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock = inventory.filter(i => i.stock === 0).length;
  const lowStock   = inventory.filter(i => i.stock > 0 && i.stock < 10).length;
  const inStock    = inventory.filter(i => i.stock >= 10).length;

  return (
    <div style={{ maxWidth: 860 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Controls */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <select value={stallId} onChange={e => setStallId(e.target.value)} style={{ flex:"1 1 180px", minWidth:140, width:"auto" }}>
          {stalls.map(s => <option key={s.id} value={s.id}>{s.name} — {s.company || "–"}</option>)}
        </select>
        <input
          placeholder="Search candy…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex:"2 1 160px", minWidth:140 }}
        />
        {loading && <span style={{ display:"inline-block", animation:"spin .8s linear infinite", color:"var(--gold2)", fontSize:18 }}>↻</span>}
      </div>

      {/* Summary pills */}
      {inventory.length > 0 && (
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {[
            [`${inventory.length} Total`,  "var(--cream2)",  "var(--bg4)",      "var(--border1)"],
            [`${inStock} In Stock`,         "var(--green)",   "var(--green-bg)", "var(--green-border)"],
            [`${lowStock} Low`,             "var(--gold3)",   "var(--bg5)",      "var(--border2)"],
            [`${outOfStock} Out`,           "var(--red)",     "var(--red-bg)",   "var(--red-border)"],
          ].map(([label, color, bg, border]) => (
            <div key={label} style={{ padding:"6px 14px", borderRadius:99, background:bg, border:`1px solid ${border}`, fontSize:12, fontWeight:700, color }}>
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div style={{ borderRadius:13, border:"1px solid var(--border1)", overflow:"hidden", background:"var(--bg3)" }}>
          <div style={{ overflowX:"auto" }}>
            <table className="v-table" style={{ minWidth:340 }}>
              <thead>
                <tr>
                  <th>Candy</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign:"center" }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.candy_id}>
                    <td style={{ fontWeight:500, color:"var(--cream4)" }}>{item.name}</td>
                    <td style={{ color:"var(--cream1)", fontSize:12 }}>{item.category || "–"}</td>
                    <td style={{ color:"var(--gold3)", fontWeight:600 }}>₹{item.price}</td>
                    <td style={{ textAlign:"center" }}>
                      <span style={{
                        fontFamily:"'Cormorant Garamond',serif",
                        fontWeight:800, fontSize:17,
                        color: item.stock === 0 ? "var(--red)" : item.stock < 10 ? "var(--gold3)" : "var(--green)",
                      }}>
                        {item.stock === 0 ? "OUT" : item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && inventory.length === 0 && stallId && (
        <div style={{ textAlign:"center", padding:"50px 0", color:"var(--cream0)" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
          <div style={{ fontSize:14 }}>No inventory data for this stall.</div>
        </div>
      )}
    </div>
  );
}
