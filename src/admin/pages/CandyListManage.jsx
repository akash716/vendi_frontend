import { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import { useParams } from "react-router-dom";
import API_URL from "../../config";

const BASE_URL = API_URL;
const API = `${API_URL}/api/admin/candy-lists`;
const GLOBAL_CANDIES_API = `${API_URL}/api/admin/candies`;

export default function CandyListManage() {
    const { id } = useParams();

    const [list, setList] = useState(null);
    const [items, setItems] = useState([]);
    const [editPrices, setEditPrices] = useState({});
    const [globalCandies, setGlobalCandies] = useState([]);

    const [addCandyId, setAddCandyId] = useState("");
    const [addCandyPrice, setAddCandyPrice] = useState("");

    useEffect(() => {
        loadList();
        loadGlobalCandies();
    }, [id]);

    const loadList = async () => {
        const res = await adminFetch(`${API}/${id}`);
        const data = await res.json();

        setList(data.list);
        setItems(data.items || []);

        const map = {};
        data.items?.forEach(i => {
            map[i.id] = i.price;
        });
        setEditPrices(map);
    };

    const loadGlobalCandies = async () => {
        const res = await adminFetch(GLOBAL_CANDIES_API);
        const data = await res.json();
        setGlobalCandies(data || []);
    };

    const updatePrice = async (itemId) => {
        await adminFetch(`${API}/item/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: Number(editPrices[itemId]) })
        });
        loadList();
    };

    const removeCandy = async (itemId) => {
        await adminFetch(`${API}/item/${itemId}`, { method: "DELETE" });
        loadList();
    };

    const addCandy = async () => {
        if (!addCandyId || !addCandyPrice) return;

        await adminFetch(`${API}/${id}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                candy_id: Number(addCandyId),
                price: Number(addCandyPrice)
            })
        });

        setAddCandyId("");
        setAddCandyPrice("");
        loadList();
    };

    if (!list) return <div style={{ padding: 30 }}>Loading...</div>;

    const available = globalCandies.filter(
        g => !items.some(i => i.candy_id === g.id)
    );

    return (
        <div style={{ padding: 30 }}>
            <h2 style={{ marginBottom: 20 }}>📋 {list.name}</h2>

            {/* Add Section */}
            <div style={styles.addBox}>
                <select
                    value={addCandyId}
                    onChange={(e) => setAddCandyId(e.target.value)}
                    style={styles.select}
                >
                    <option value="">Select candy</option>
                    {available.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name} — ₹{c.price}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Price"
                    value={addCandyPrice}
                    onChange={(e) => setAddCandyPrice(e.target.value)}
                    style={styles.input}
                />

                <button onClick={addCandy} style={styles.primaryBtn}>
                    Add
                </button>
            </div>

            {/* Cards */}
            <div style={styles.grid}>
                {items.map(item => (
                    <div key={item.id} style={styles.card}>
                        {item.image && (
                            <img
                                src={`${BASE_URL}${item.image}`}
                                alt={item.name}
                                style={styles.image}
                            />
                        )}

                        <div style={{ fontWeight: 600 }}>{item.name}</div>

                        <div style={styles.priceSection}>
                            <input
                                type="number"
                                value={editPrices[item.id] || ""}
                                onChange={(e) =>
                                    setEditPrices({
                                        ...editPrices,
                                        [item.id]: e.target.value
                                    })
                                }
                                style={styles.priceInput}
                            />

                            <div style={styles.buttonRow}>
                                <button
                                    onClick={() => updatePrice(item.id)}
                                    style={styles.saveBtn}
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => removeCandy(item.id)}
                                    style={styles.removeBtn}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const styles = {
    addBox: {
        display: "flex",
        gap: 10,
        marginBottom: 30,
        padding: 15,
        background: "var(--c-bg-3)",
        borderRadius: 12,
        alignItems: "center"
    },
    select: {
        padding: 8,
        borderRadius: 8,
        border: "1px solid var(--c-border)"
    },
    input: {
        padding: 8,
        borderRadius: 8,
        border: "1px solid var(--c-border)",
        width: 120
    },
    primaryBtn: {
        padding: "8px 14px",
        borderRadius: 8,
        background: "var(--c-cream)",
        color: "var(--c-surface)",
        border: "none",
        cursor: "pointer"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 20
    },
    card: {
        background: "var(--c-surface)",
        padding: 16,
        borderRadius: 14,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },
    image: {
        width: "100%",
        height: 160,
        objectFit: "cover",
        borderRadius: 10
    },
   priceSection: {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 8
},

priceInput: {
  width: "100%",
  padding: 8,
  borderRadius: 8,
  border: "1px solid var(--c-border)",
  fontSize: 14
},

buttonRow: {
  display: "flex",
  gap: 10
},

saveBtn: {
  flex: 1,
  padding: "8px 0",
  borderRadius: 8,
  background: "var(--c-cream)",
  color: "var(--c-surface)",
  border: "none",
  cursor: "pointer",
  fontWeight: 500
},

removeBtn: {
  flex: 1,
  padding: "8px 0",
  borderRadius: 8,
  background: "var(--red)",
  color: "var(--c-surface)",
  border: "none",
  cursor: "pointer",
  fontWeight: 500
}

};
