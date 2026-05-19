import React from "react";
import { CandyCard } from "./ComboGrid";

// Fixed display order for Big Combo — matched by code
const BIG_COMBO_ORDER = [
  "MC4","MC5","MC6",      // Row 1: Creamy Milk 50g, Crunchy Almond 50g, Zesty Orange 50g
  "DC6","MC7",            // Row 2: 65% Dark 50g, 70% Dark Zesty Orange 50g
  "DC7","DC8","DC9",      // Row 3: 72% No Sugar 50g, 72% Almond Raisin 50g, 85% Dark 50g
];

function sortByFixedOrder(list) {
  return [...list].sort((a, b) => {
    const ai = BIG_COMBO_ORDER.indexOf(a.code);
    const bi = BIG_COMBO_ORDER.indexOf(b.code);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function BigComboGrid({ candies=[], offers=[], selected=[], onChange, mobile }) {
  const validPrices = React.useMemo(() => {
    const s = new Set();
    offers.forEach(o => {
      if (o.price != null) s.add(Number(o.price));
      if (Array.isArray(o.price_pattern)) o.price_pattern.forEach(p => s.add(Number(p.price)));
    });
    return s;
  }, [offers]);

  const list = sortByFixedOrder(
    candies.filter(c => validPrices.size > 0 ? validPrices.has(Number(c.price)) : Number(c.price) > 100)
  );

  const countOf = id => selected.filter(c => c.id === id).length;
  const gap = mobile ? 8 : 12;

  return (
    <div style={{ maxWidth: mobile ? "100%" : 520 }}>
      <p style={{ marginBottom:12, color:"var(--cream1)", fontSize:12 }}>
        Tap image to add · tap − to remove.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap }}>
        {list.map(c => (
          <CandyCard key={c.id} c={c} qty={countOf(c.id)} onChange={onChange} mobile={mobile}/>
        ))}
        {list.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"40px 0", color:"var(--cream0)", fontSize:13 }}>
            No candies available.
          </div>
        )}
      </div>
    </div>
  );
}
