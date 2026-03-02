import React from "react";
import { CandyCard } from "./ComboGrid";

function chunk(arr,n){const o=[];for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n));return o;}

export default function BigComboGrid({ candies=[], offers=[], selected=[], onChange, mobile }) {
  const validPrices = React.useMemo(() => {
    const s = new Set();
    offers.forEach(o => {
      if (o.price != null) s.add(Number(o.price));
      if (Array.isArray(o.price_pattern)) o.price_pattern.forEach(p => s.add(Number(p.price)));
    });
    return s;
  }, [offers]);

  const list = candies
    .filter(c => validPrices.size > 0 ? validPrices.has(Number(c.price)) : Number(c.price) > 100)
    .sort((a,b) => Number(a.price)!==Number(b.price) ? Number(a.price)-Number(b.price) : a.name.localeCompare(b.name));

  const countOf = id => selected.filter(c=>c.id===id).length;
  const gap = mobile ? 8 : 12;
  const maxW = mobile ? "100%" : 520;

  // Group by price, max 3 per row (same logic as ComboGrid)
  const priceGroups = React.useMemo(() => {
    const map = new Map();
    list.forEach(c => {
      const key = Number(c.price);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return [...map.entries()];
  }, [list]);

  return (
    <div style={{ maxWidth: maxW }}>
      <p style={{ marginBottom:10, color:"var(--cream1)", fontSize:12 }}>Tap + / − to build your premium combo — applies automatically.</p>
      <div style={{ display:"flex", flexDirection:"column", gap: mobile ? 14 : 18 }}>
        {priceGroups.map(([price, group]) => (
          <div key={price}>
            <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--gold3)", background:"rgba(200,132,42,.12)", border:"1px solid rgba(200,132,42,.2)", padding:"2px 10px", borderRadius:99 }}>
                ₹{price}
              </span>
              <div style={{ flex:1, height:1, background:"var(--border0)" }}/>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap }}>
              {chunk(group, 3).map((row, ri) => (
                <div key={ri} style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap }}>
                  {row.map(c => <CandyCard key={c.id} c={c} qty={countOf(c.id)} onChange={onChange} mobile={mobile}/>)}
                  {row.length < 3 && Array.from({length: 3-row.length}).map((_,i) => (
                    <div key={`e${i}`} style={{ visibility:"hidden" }}/>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
        {list.length===0 && <div style={{ textAlign:"center", padding:"40px 0", color:"var(--cream0)", fontSize:13 }}>No candies available.</div>}
      </div>
    </div>
  );

}
