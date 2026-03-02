// src/admin/pages/stall/StallLists.jsx
import React, { useEffect, useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import API_URL from "../../../config";

const API_BASE = API_URL;

export default function StallLists({ stallId }) {
  const [loading, setLoading] = useState(true);
  const [candyLists, setCandyLists] = useState([]);
  const [offerLists, setOfferLists] = useState([]);
  const [stall, setStall] = useState(null);
  const [candyListId, setCandyListId] = useState("");
  const [offerListId, setOfferListId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [clRes, olRes, stallsRes] = await Promise.all([
          adminFetch(`${API_BASE}/api/admin/candy-lists`),
          adminFetch(`${API_BASE}/api/admin/offer-lists`),
          adminFetch(`${API_BASE}/api/admin/stalls`)
        ]);

        const [clData, olData, stallsData] = await Promise.all([
          clRes.json(),
          olRes.json(),
          stallsRes.json()
        ]);

        setCandyLists(Array.isArray(clData) ? clData : []);
        setOfferLists(Array.isArray(olData) ? olData : []);
        const s = (stallsData || []).find(x => Number(x.id) === Number(stallId)) || null;
        setStall(s);
        setCandyListId(s?.candy_list_id ?? "");
        setOfferListId(s?.offer_list_id ?? "");
      } catch (err) {
        console.error("Failed to load lists", err);
        alert("Failed to load lists");
      } finally {
        setLoading(false);
      }
    }

    if (stallId) load();
  }, [stallId]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminFetch(`${API_BASE}/api/admin/stalls/${stallId}/lists`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candy_list_id: candyListId || null,
          offer_list_id: offerListId || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Save failed");
      }

      alert("Saved");
      // update local stall state
      setStall(prev => ({ ...(prev || {}), candy_list_id: candyListId || null, offer_list_id: offerListId || null }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading lists…</p>;

  return (
    <div style={{ border: "1px solid var(--c-border)", padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Assigned Lists</h3>

      {!stall && (
        <div style={{ color: "crimson" }}>
          Stall not found. Make sure the stall exists.
        </div>
      )}

      <div style={{ display: "grid", gap: 12, maxWidth: 700 }}>
        <label>
          <div style={{ fontWeight: 600 }}>Candy List</div>
          <select
            value={candyListId ?? ""}
            onChange={e => setCandyListId(e.target.value)}
            style={{ padding: 8, width: "100%", marginTop: 6 }}
          >
            <option value="">— none —</option>
            {candyLists.map(cl => (
              <option key={cl.id} value={cl.id}>
                {cl.name} (#{cl.id})
              </option>
            ))}
          </select>
        </label>

        <label>
          <div style={{ fontWeight: 600 }}>Offer List</div>
          <select
            value={offerListId ?? ""}
            onChange={e => setOfferListId(e.target.value)}
            style={{ padding: 8, width: "100%", marginTop: 6 }}
          >
            <option value="">— none —</option>
            {offerLists.map(ol => (
              <option key={ol.id} value={ol.id}>
                {ol.name} (#{ol.id})
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: "8px 14px",
              background: "#0b6cff",
              color: "var(--c-surface)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {saving ? "Saving…" : "Save Lists"}
          </button>

          <button
            onClick={() => {
              setCandyListId(stall?.candy_list_id ?? "");
              setOfferListId(stall?.offer_list_id ?? "");
            }}
            style={{
              padding: "8px 14px",
              background: "var(--c-border)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <small style={{ display: "block", marginTop: 12, color: "var(--c-text-3)" }}>
        Assigning a candy list controls inventory & pricing. Offer list controls available combo rules.
      </small>
    </div>
  );
}
