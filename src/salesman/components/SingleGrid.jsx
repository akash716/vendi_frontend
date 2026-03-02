import React, { useState, useMemo } from "react";
import API_URL from "../../config";

const BASE = API_URL;

const CAT_PALETTES = [
  { bg:"rgba(200,132,42,.12)", border:"var(--gold2)",   text:"var(--gold3)",   dot:"var(--gold2)" },
  { bg:"rgba(61,184,112,.1)",  border:"var(--green)",   text:"var(--green)",   dot:"var(--green)" },
  { bg:"rgba(90,172,224,.1)",  border:"var(--blue)",    text:"var(--blue)",    dot:"var(--blue)"  },
  { bg:"rgba(192,128,224,.1)", border:"#c080e0",        text:"#c080e0",        dot:"#c080e0"      },
  { bg:"rgba(224,176,80,.1)",  border:"var(--gold3)",   text:"var(--gold4)",   dot:"var(--gold3)" },
  { bg:"rgba(224,80,64,.1)",   border:"var(--red)",     text:"var(--red)",     dot:"var(--red)"   },
];

export default function SingleGrid({ candies=[], onSelect, mobile }) {
  const [selectedCat, setSelectedCat] = useState(null);

  const categories = useMemo(() => {
    const seen = new Set(), list = [];
    candies.forEach(c => {
      const cat = c.category || "Other";
      if (!seen.has(cat)) { seen.add(cat); list.push(cat); }
    });
    return list;
  }, [candies]);

  const filtered = useMemo(() => {
    if (!selectedCat) return [];
    return [...candies]
      .filter(c => (c.category || "Other") === selectedCat)
      .sort((a,b) => {
        if (a.name==="Hazelnut") return 1; if (b.name==="Hazelnut") return -1;
        return Number(a.price) - Number(b.price);
      });
  }, [candies, selectedCat]);

  if (!candies.length) return <p style={{ color:"var(--cream1)", textAlign:"center", padding:40, fontSize:13 }}>No candies available</p>;

  /* ── Category picker popup ── */
  if (!selectedCat) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
      <div style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:20, padding: mobile ? "22px 16px" : "28px 24px", width:"100%", maxWidth:380, boxShadow:"0 30px 80px rgba(0,0,0,.6)" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:34, marginBottom:8 }}>🍫</div>
          <h3 style={{ margin:"0 0 5px", fontSize: mobile ? "1.15rem" : "1.3rem" }}>Select Category</h3>
          <p style={{ fontSize:12, color:"var(--cream1)", margin:0 }}>Which chocolate would you like?</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {categories.map((cat, idx) => {
            const pal = CAT_PALETTES[idx % CAT_PALETTES.length];
            const total   = candies.filter(c=>(c.category||"Other")===cat).length;
            const inStock = candies.filter(c=>(c.category||"Other")===cat&&(c.stock??0)>0).length;
            return (
              <button key={cat} onClick={() => setSelectedCat(cat)} style={{
                padding: mobile ? "13px 16px" : "14px 18px",
                borderRadius:13, border:`1.5px solid ${pal.border}`,
                background:pal.bg, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                minHeight:"unset", transition:"opacity .15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.opacity=".8"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
              >
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:pal.dot, flexShrink:0 }}/>
                  <span style={{ fontWeight:700, fontSize: mobile ? 15 : 16, color:pal.text }}>{cat}</span>
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:pal.text, opacity:.75, background:"rgba(0,0,0,.25)", padding:"3px 9px", borderRadius:99 }}>
                  {inStock}/{total} in stock
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── Candy grid ── */
  const catIdx = categories.indexOf(selectedCat);
  const pal = CAT_PALETTES[catIdx % CAT_PALETTES.length];
  // Desktop: 4 cards per row max, consistent size. Cap grid width.
  const cols = mobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)";
  const imgH = mobile ? 95 : 120;
  const maxW = mobile ? "100%" : 680;

  return (
    <div style={{ maxWidth: maxW }}>
      {/* Sub-header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <button onClick={() => setSelectedCat(null)} style={{
          padding: mobile ? "5px 10px" : "6px 12px", borderRadius:20,
          border:"1px solid var(--border1)", background:"transparent",
          color:"var(--cream2)", fontSize:12, fontWeight:600, cursor:"pointer", minHeight:"unset",
        }}>← Categories</button>
        <span style={{ padding:"4px 12px", borderRadius:20, background:pal.bg, color:pal.text, border:`1px solid ${pal.border}`, fontWeight:700, fontSize:12 }}>
          {selectedCat}
        </span>
        <span style={{ fontSize:11, color:"var(--cream1)" }}>{filtered.length} items</span>

        {/* Other category chips — hide some on mobile */}
        {!mobile && categories.filter(c=>c!==selectedCat).map((cat,i) => {
          const ap = CAT_PALETTES[categories.indexOf(cat) % CAT_PALETTES.length];
          return (
            <button key={cat} onClick={() => setSelectedCat(cat)} style={{
              padding:"4px 10px", borderRadius:20,
              border:`1px solid ${ap.border}`, background:"transparent",
              color:ap.text, fontSize:11, fontWeight:600, cursor:"pointer", minHeight:"unset",
            }}>{cat}</button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:cols, gap: mobile ? 8 : 12 }}>
        {filtered.map(c => {
          const outOfStock = (c.stock ?? 0) <= 0;
          return (
            <div key={c.id} onClick={() => !outOfStock && onSelect({...c})} style={{
              borderRadius: mobile ? 12 : 16, overflow:"hidden",
              background:"var(--bg3)", border:"1px solid var(--border1)",
              cursor: outOfStock ? "not-allowed" : "pointer",
              opacity: outOfStock ? 0.38 : 1,
              transition:"transform .15s, box-shadow .15s",
              boxShadow:"0 2px 8px rgba(0,0,0,.25)",
              WebkitTapHighlightColor:"transparent",
              // touch feedback
              activeStyle:{ transform:"scale(.97)" },
            }}
            onTouchStart={e => { if(!outOfStock) e.currentTarget.style.transform="scale(.96)"; }}
            onTouchEnd={e => { e.currentTarget.style.transform=""; }}
            onMouseEnter={e => { if(!outOfStock) e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 18px rgba(0,0,0,.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.25)"; }}
            >
              <div style={{ height:imgH, position:"relative", background:"var(--bg5)" }}>
                {c.image
                  ? <img src={`${BASE}${c.image}`} alt={c.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--cream0)", fontSize:10 }}>No Image</div>
                }
                <div style={{ position:"absolute", top:4, left:4, background:"rgba(0,0,0,.78)", color:"var(--gold3)", padding:"2px 6px", borderRadius:5, fontSize:10, fontWeight:700 }}>
                  ₹{Number(c.price).toFixed(0)}
                </div>
                <div style={{ position:"absolute", top:4, right:4, background: outOfStock?"var(--red-bg)":"var(--green-bg)", color: outOfStock?"var(--red)":"var(--green)", padding:"2px 6px", borderRadius:5, fontSize:9, fontWeight:600, border:`1px solid ${outOfStock?"var(--red-border)":"var(--green-border)"}` }}>
                  {outOfStock ? "OUT" : c.stock}
                </div>
              </div>
              <div style={{ padding: mobile ? "5px 6px 8px" : "8px 10px 10px", textAlign:"center" }}>
                <div style={{ fontWeight:700, fontSize: mobile ? 11 : 13, color:"var(--cream4)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {c.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
