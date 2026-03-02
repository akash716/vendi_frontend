// src/admin/pages/OfferListManage.jsx
import React, { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import { useParams } from "react-router-dom";
import API_URL from "../../config";

const API_BASE = API_URL;

export default function OfferListManage() {
  const { id: offerListId } = useParams();
  const [rules, setRules] = useState([]);
  const [comboSize, setComboSize] = useState(3);
  const [offerPrice, setOfferPrice] = useState("");
  const [comboType, setComboType] = useState("SAME");
  const [priceOn, setPriceOn] = useState("");
  const [priceRows, setPriceRows] = useState([{ price: "", qty: "" }]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!offerListId) return;
    loadRules();
    // eslint-disable-next-line
  }, [offerListId]);

  async function loadRules() {
    setLoading(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/combo-offer-rules?offer_list_id=${offerListId}`);
      const data = await res.json();
      const loaded = data?.rules ?? [];
      setRules(loaded);
    } catch (err) {
      console.error(err);
      alert("Failed to load rules");
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setComboSize(3);
    setOfferPrice("");
    setComboType("SAME");
    setPriceOn("");
    setPriceRows([{ price: "", qty: "" }]);
    setEditingId(null);
  }

  function editRule(r) {
    setEditingId(r.id);
    setComboSize(r.unique_count);
    setOfferPrice(r.offer_price);
    if (r.price !== null) {
      setComboType("SAME");
      setPriceOn(r.price);
      setPriceRows([{ price: "", qty: "" }]);
    } else {
      setComboType("MIXED");
      setPriceRows((r.price_pattern && r.price_pattern.length) ? r.price_pattern.map(p => ({ price: p.price, qty: p.qty })) : [{ price: "", qty: "" }]);
    }
  }

  async function saveRule() {
    if (!offerPrice) return alert("Offer price required");
    if (!comboSize || Number(comboSize) <= 0) return alert("Combo size must be > 0");

    const payload = {
      offer_list_id: Number(offerListId),
      unique_count: Number(comboSize),
      offer_price: Number(offerPrice),
      price: null,
      price_pattern: null
    };

    if (comboType === "SAME") {
      if (!priceOn) return alert("Candy price required");
      payload.price = Number(priceOn);
    } else {
      const cleaned = priceRows.map(r => ({ price: Number(r.price), qty: Number(r.qty) })).filter(r => r.price && r.qty);
      const totalQty = cleaned.reduce((s, r) => s + r.qty, 0);
      if (totalQty !== Number(comboSize)) return alert("Total qty in pattern must equal combo size");
      payload.price_pattern = cleaned;
    }

    try {
      const url = editingId ? `${API_BASE}/api/admin/combo-offer-rules/${editingId}` : `${API_BASE}/api/admin/combo-offer-rules`;
      const method = editingId ? "PUT" : "POST";
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      resetForm();
      loadRules();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save");
    }
  }

  async function removeRule(id) {
    if (!window.confirm("Deactivate this rule? It will no longer apply to sales.")) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/combo-offer-rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      loadRules();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Offer List #{offerListId} — Rules</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* left: form */}
        <div style={{ border: "1px solid var(--c-border)", padding: 12, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Rule" : "Create Rule"}</h3>

          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            <label><input type="radio" checked={comboType === "SAME"} onChange={() => setComboType("SAME")} /> Same</label>
            <label><input type="radio" checked={comboType === "MIXED"} onChange={() => setComboType("MIXED")} /> Mixed</label>
          </div>

          <input style={{ width: "100%", padding: 8, marginBottom: 8 }} type="number" value={comboSize} onChange={e => setComboSize(e.target.value)} placeholder="Combo size" />

          {comboType === "SAME" && (
            <input style={{ width: "100%", padding: 8, marginBottom: 8 }} type="number" value={priceOn} onChange={e => setPriceOn(e.target.value)} placeholder="Candy price to match" />
          )}

          {comboType === "MIXED" && priceRows.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input placeholder="price" value={r.price} onChange={e => { const next = [...priceRows]; next[i].price = e.target.value; setPriceRows(next); }} />
              <input placeholder="qty" value={r.qty} onChange={e => { const next = [...priceRows]; next[i].qty = e.target.value; setPriceRows(next); }} />
              <button onClick={() => { const next = priceRows.filter((_, idx) => idx !== i); setPriceRows(next.length ? next : [{ price: "", qty: "" }]); }}>Remove</button>
            </div>
          ))}

          {comboType === "MIXED" && (
            <button onClick={() => setPriceRows([...priceRows, { price: "", qty: "" }])} style={{ marginBottom: 8 }}>Add Row</button>
          )}

          <input style={{ width: "100%", padding: 8, marginBottom: 12 }} placeholder="Offer price" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={saveRule}>{editingId ? "Update" : "Save"}</button>
            {editingId && <button onClick={resetForm}>Cancel</button>}
          </div>
        </div>

        {/* right: rules list */}
        <div>
          <h3>Existing Rules</h3>
          {loading && <div>Loading…</div>}
          {!loading && rules.length === 0 && <div>No rules yet for this list.</div>}

          {rules.map(r => (
            <div key={r.id} style={{ border: "1px solid var(--c-border)", padding: 12, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  Pick {r.unique_count} {r.price !== null ? `@ ₹${r.price}` : "(Mixed)"}
                </div>
                <div>Offer ₹{r.offer_price}</div>
                {r.price_pattern && r.price_pattern.length > 0 && (
                  <div style={{ color: "var(--c-text-3)", fontSize: 13 }}>
                    Pattern: {r.price_pattern.map(p => `${p.qty}×₹${p.price}`).join(", ")}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => editRule(r)}>Edit</button>
                <button onClick={() => removeRule(r.id)} style={{ background: "red", color: "var(--c-surface)", border: "none", padding: "6px 8px", borderRadius: 6 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
