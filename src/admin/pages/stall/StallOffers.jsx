import { useEffect, useState } from "react";
import { adminFetch } from "../../auth/adminFetch";
import API_URL from "../../../config";

export default function StallOffers({ stallId }) {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState([]);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!stallId) return;

    // 1️⃣ Load all offers
    adminFetch(`${API_URL}/api/admin/offers`)
      .then(res => res.json())
      .then(setOffers);

    // 2️⃣ Load already assigned offers for this stall
    adminFetch(`${API_URL}/api/admin/stall-offers/${stallId}`)
      .then(res => res.json())
      .then(data => {
        // data = [{ offer_id: 1 }, ...]
        setSelected(data.map(o => o.offer_id));
      });

  }, [stallId]);

  /* ---------------- TOGGLE ---------------- */

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  /* ---------------- SAVE ---------------- */

  const save = async () => {
    if (!stallId) {
      alert("Stall ID missing");
      return;
    }

    await adminFetch(`${API_URL}/api/admin/stall-offers/${stallId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerIds: selected })
    });

    alert("Offers assigned to stall");
  };

  /* ---------------- UI ---------------- */

  return (
    <div>
      <h3>Assign Offers</h3>

      {offers.length === 0 && <p>No offers created yet</p>}

      {offers.map(o => (
        <label key={o.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selected.includes(o.id)}
            onChange={() => toggle(o.id)}
          />
          {o.title}
        </label>
      ))}

      <br />
      <button onClick={save}>Save</button>
    </div>
  );
}
