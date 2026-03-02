// src/admin/pages/OfferLists.jsx
import React, { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config";

const API_BASE = API_URL;

export default function OfferLists() {
  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/offer-lists`);
      const data = await res.json();
      setLists(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load offer lists");
    }
  }

  async function create() {
    if (!name.trim()) return alert("Name required");
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/offer-lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Create failed");
      }
      setName("");
      load();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this offer list and all its rules? This cannot be undone.")) return;
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/offer-lists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Offer Lists</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input placeholder="New offer list name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create} className="btn-primary">Create</button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {lists.map(l => (
          <div key={l.id} style={{ border: "1px solid var(--c-border)", padding: 12, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{l.name}</strong>
              <div style={{ color: "var(--c-text-3)" }}>ID: {l.id}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate(`/admin/offer-lists/${l.id}`)} className="btn-primary">Manage</button>
              <button onClick={() => remove(l.id)} style={{ background: "red", color: "var(--c-surface)", border: "none", padding: "8px 10px", borderRadius: 6 }}>Delete</button>
            </div>
          </div>
        ))}

        {lists.length === 0 && <div>No offer lists yet</div>}
      </div>
    </div>
  );
}
