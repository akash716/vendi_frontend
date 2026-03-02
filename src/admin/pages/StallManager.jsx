import { useParams } from "react-router-dom";
import { adminFetch } from "../auth/adminFetch";
import { useState } from "react";
import StallInventory from "./stall/StallInventory";
import StallLists from "./stall/StallLists";
// import StallOffers from "./stall/StallOffers";

export default function StallManager() {
  const { stallId } = useParams();
  const [tab, setTab] = useState("LISTS");

  const tabStyle = (active) => ({
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid var(--border-color)",
    background: active ? "var(--btn-primary)" : "var(--card-bg)",
    color: active ? "var(--c-surface)" : "var(--text-primary)",
    fontWeight: 600,
    cursor: "pointer"
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Stall #{stallId}</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap:"wrap" }}>
        <button
          onClick={() => setTab("LISTS")}
          style={tabStyle(tab === "LISTS")}
        >
          Lists
        </button>

        <button
          onClick={() => setTab("INVENTORY")}
          style={tabStyle(tab === "INVENTORY")}
        >
          Inventory
        </button>

        {/* <button
          onClick={() => setTab("OFFERS")}
          style={tabStyle(tab === "OFFERS")}
        >
          Offers
        </button> */}
      </div>

      {tab === "LISTS" && <StallLists stallId={stallId} />}
      {tab === "INVENTORY" && <StallInventory stallId={stallId} />}
      {/* {tab === "OFFERS" && <StallOffers stallId={stallId} />} */}
    </div>
  );
}
