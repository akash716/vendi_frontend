import React from "react";
import { CandyCard } from "./ComboGrid";

// Fixed display order for Big Combo — by DB id
// Row 1: id14 MC4, id15 MC5, id16 MC6
// Row 2: id18 DC6, id17 MC7
// Row 3: id19 DC7, id20 DC8, id21 DC9
const BIG_COMBO_ID_ORDER = [14, 15, 16, 18, 17, 19, 20, 21];

function sortByFixedOrder(list) {
  return [...list].sort((a, b) => {
    const ai = BIG_COMBO_ID_ORDER.indexOf(a.id);
    const bi = BIG_COMBO_ID_ORDER.indexOf(b.id);
    if (ai === -1 && bi === -1) return (a.sort_order ?? 99) - (b.sort_order ?? 99);
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

  const countOf = (id) => selected.filter((c) => c.id === id).length;
  const gap = mobile ? 8 : 12;

  return (
    <div style={{ maxWidth: mobile ? "100%" : 520 }}>
      <p style={{ marginBottom: 12, color: "var(--cream1)", fontSize: 12 }}>
        Tap image to add · tap − to remove.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap }}>
        {list.map((c) => (
          <CandyCard
            key={c.id}
            c={c}
            qty={countOf(c.id)}
            onChange={onChange}
            mobile={mobile}
          />
        ))}
        {list.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "40px 0",
              color: "var(--cream0)",
              fontSize: 13,
            }}
          >
            No candies available.
          </div>
        )}
      </div>
    </div>
  );
}
