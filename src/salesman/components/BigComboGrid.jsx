import React from "react";
import { CandyCard } from "./ComboGrid";

const BIG_COMBO_ID_ORDER = [14, 15, 16, 18, 17, 19, 20, 21];

function sortByFixedOrder(list) {
  return [...list].sort((a, b) => {
    const priceDiff = Number(a.price) - Number(b.price);
    if (priceDiff !== 0) return priceDiff;
    const ai = BIG_COMBO_ID_ORDER.indexOf(Number(a.id));
    const bi = BIG_COMBO_ID_ORDER.indexOf(Number(b.id));
    if (ai === -1 && bi === -1) return Number(a.id) - Number(b.id);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function BigComboGrid({ candies = [], offers = [], selected = [], onChange, mobile }) {
  const validPrices = React.useMemo(() => {
    const s = new Set();
    offers.forEach((o) => {
      if (o.price != null) s.add(Number(o.price));
      if (Array.isArray(o.price_pattern))
        o.price_pattern.forEach((p) => s.add(Number(p.price)));
    });
    return s;
  }, [offers]);

  const list = sortByFixedOrder(
    candies.filter((c) =>
      validPrices.size > 0
        ? validPrices.has(Number(c.price))
        : Number(c.price) > 100
    )
  );

  const groups = React.useMemo(() => {
    const map = new Map();
    list.forEach((c) => {
      const p = Number(c.price);
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(c);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [list]);

  const countOf = (id) => selected.filter((c) => c.id === id).length;
  const gap = mobile ? 8 : 12;

  if (list.length === 0) {
    return (
      <div style={{ maxWidth: mobile ? "100%" : 520 }}>
        <p style={{ marginBottom: 12, color: "var(--cream1)", fontSize: 12 }}>Tap image to add · tap − to remove.</p>
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--cream0)", fontSize: 13 }}>No candies available.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: mobile ? "100%" : 520 }}>
      <p style={{ marginBottom: 12, color: "var(--cream1)", fontSize: 12 }}>Tap image to add · tap − to remove.</p>
      {groups.map(([price, items], gi) => (
        <div key={price} style={{ marginTop: gi > 0 ? gap : 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap }}>
            {items.map((c) => (
              <CandyCard key={c.id} c={c} qty={countOf(c.id)} onChange={onChange} mobile={mobile} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
