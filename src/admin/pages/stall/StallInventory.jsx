import React, { useEffect, useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import API_URL from "../../../config";

export default function StallInventory({ stallId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);

    adminFetch(`${API_URL}/api/admin/inventory/${stallId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load inventory");
        return res.json();
      })
      .then(data => {
        setItems(data || []);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load inventory");
        setLoading(false);
      });
  }, [stallId]);

  const handleChange = (candyId, value) => {
    setItems(prev =>
      prev.map(i =>
        i.candy_id === candyId
          ? { ...i, stock: Math.max(0, Number(value)) }
          : i
      )
    );
  };

  const saveAll = async () => {
    try {
      setSaving(true);

      const res = await adminFetch(
        `${API_URL}/api/admin/inventory/${stallId}/bulk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(i => ({
              candyId: i.candy_id,
              stock: Number(i.stock)
            }))
          })
        }
      );

      if (!res.ok) throw new Error("Save failed");

      alert("Inventory updated successfully");
    } catch (e) {
      alert("Failed to save inventory");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Loading inventory…</p>;
  }

  return (
    <div
      style={{
        background: "var(--panel-bg)",
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--border-color)"
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Stall Inventory
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14
        }}
      >
        {items.map(i => (
          <div
            key={i.candy_id}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-color)",
              background: "var(--card-bg)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {i.name}
            </div>

            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
              ₹{Number(i.price).toFixed(0)}
            </div>

            <input
              type="number"
              min="0"
              value={i.stock}
              onChange={e =>
                handleChange(i.candy_id, e.target.value)
              }
              style={{
                marginTop: 6,
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid var(--border-color)"
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={saveAll}
        disabled={saving}
        style={{
          marginTop: 18,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "none",
          background: "var(--btn-primary)",
          color: "var(--c-surface)",
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Saving…" : "Save All Changes"}
      </button>
    </div>
  );
}
