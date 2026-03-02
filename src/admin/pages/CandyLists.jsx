// src/admin/pages/CandyLists.jsx
import { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config";

const API = `${API_URL}/api/admin/candy-lists`;
const GLOBAL_API = `${API_URL}/api/admin/candies`;

export default function CandyLists() {
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [globalCandies, setGlobalCandies] = useState([]);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdListId, setCreatedListId] = useState(null);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    loadLists();
    loadGlobal();
  }, []);

  const loadLists = async () => {
    const res = await adminFetch(API);
    const data = await res.json();
    setLists(data || []);
  };

  const loadGlobal = async () => {
    const res = await adminFetch(GLOBAL_API);
    const data = await res.json();
    setGlobalCandies(data || []);
  };

  /* ================= CREATE ================= */

  const createList = async () => {
    if (!newName.trim()) return alert("Enter list name");

    const res = await adminFetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });

    const data = await res.json();

    setCreatedListId(data.id);
    setShowModal(true);
    setNewName("");

    const init = {};
    globalCandies.forEach(c => {
      init[c.id] = { selected: false, price: c.price || 0 };
    });
    setSelected(init);

    loadLists();
  };

  /* ================= DELETE ================= */

  const deleteList = async (id) => {
    if (!window.confirm("Delete this list?")) return;

    await adminFetch(`${API}/${id}`, { method: "DELETE" });
    loadLists();
  };

  /* ================= MODAL ACTIONS ================= */

  const toggleCandy = (c) => {
    setSelected(prev => ({
      ...prev,
      [c.id]: {
        selected: !prev[c.id]?.selected,
        price: prev[c.id]?.price ?? c.price
      }
    }));
  };

  const addSelected = async () => {
    const items = Object.entries(selected)
      .filter(([, v]) => v.selected)
      .map(([id, v]) => ({
        candy_id: Number(id),
        price: Number(v.price)
      }));

    for (let item of items) {
      await adminFetch(`${API}/${createdListId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
    }

    setShowModal(false);
    navigate(`/admin/candy-lists/${createdListId}`);
  };

  /* ================= UI ================= */

  return (
    <div style={{ padding: 24 }}>
      <h2>🍫 Candy Lists</h2>

      {/* CREATE */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New list name"
          style={inputStyle}
        />
        <button onClick={createList} style={primaryBtn}>
          Create
        </button>
      </div>

      {/* LISTS */}
      <div style={{ marginTop: 30 }}>
        {lists.map(l => (
          <div key={l.id} style={card}>
            <div>
              <strong>{l.name}</strong>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={primaryBtn}
                onClick={() => navigate(`/admin/candy-lists/${l.id}`)}
              >
                Manage
              </button>

              <button
                style={dangerBtn}
                onClick={() => deleteList(l.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div style={backdrop}>
          <div style={modal}>
            <div style={modalHeader}>
              <h3>Select Candies</h3>
              <button
                style={closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={grid}>
              {globalCandies.map(c => {
                const sel = selected[c.id]?.selected;
                return (
                  <div
                    key={c.id}
                    style={{
                      ...candyCard,
                      border: sel ? "2px solid black" : "1px solid #ddd"
                    }}
                    onClick={() => toggleCandy(c)}
                  >
                    <strong>{c.name}</strong>
                    <div>₹{c.price}</div>
                  </div>
                );
              })}
            </div>

            <div style={modalFooter}>
              <button
                style={secondaryBtn}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>

              <button style={primaryBtn} onClick={addSelected}>
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const inputStyle = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid var(--c-border)"
};

const primaryBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "var(--c-cream)",
  color: "var(--c-surface)",
  border: "none",
  cursor: "pointer"
};

const secondaryBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "var(--c-surface)",
  border: "1px solid var(--c-border)",
  cursor: "pointer"
};

const dangerBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "var(--red)",
  color: "var(--c-surface)",
  border: "none",
  cursor: "pointer"
};

const card = {
  display: "flex",
  justifyContent: "space-between",
  padding: 14,
  border: "1px solid var(--c-border)",
  borderRadius: 10,
  marginBottom: 10,
  background: "var(--c-surface)"
};

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modal = {
  background: "var(--c-surface)",
  width: "90%",
  maxWidth: 1000,
  borderRadius: 12,
  padding: 20,
  maxHeight: "85vh",
  overflowY: "auto"
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const modalFooter = {
  marginTop: 20,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10
};

const closeBtn = {
  background: "none",
  border: "none",
  fontSize: 18,
  cursor: "pointer"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
  gap: 12,
  marginTop: 20
};

const candyCard = {
  padding: 14,
  borderRadius: 10,
  background: "var(--c-bg-2)",
  cursor: "pointer"
};
