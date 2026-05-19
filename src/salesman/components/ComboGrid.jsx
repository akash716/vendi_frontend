import React from "react";

const ID_ORDER = [1, 2, 3, 4, 5, 6, 7, 8];

function sortByFixedOrder(list) {
  return [...list].sort((a, b) => {
    const ai = ID_ORDER.indexOf(Number(a.id));
    const bi = ID_ORDER.indexOf(Number(b.id));
    if (ai === -1 && bi === -1) return Number(a.id) - Number(b.id);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/* ── Candy Card ── */
export function CandyCard({ c, qty, onChange, mobile }) {
  const outOfStock = (c.stock ?? 0) <= 0;
  const imgH     = mobile ? 100 : 130;
  const fontSize = mobile ? 12 : 14;

  return (
    <div
      style={{
        borderRadius: mobile ? 12 : 16,
        overflow: "hidden",
        background: "var(--bg3)",
        border: qty > 0 ? "2px solid var(--gold2)" : "1px solid var(--border1)",
        boxShadow: qty > 0 ? "0 0 0 3px rgba(200,132,42,.18)" : "none",
        opacity: outOfStock ? 0.38 : 1,
        transition: "border-color .15s, box-shadow .15s",
      }}
    >
      {/* Clickable image = ADD */}
      <div
        onClick={() => !outOfStock && onChange(c, "ADD")}
        style={{
          height: imgH,
          position: "relative",
          background: "var(--bg5)",
          cursor: outOfStock ? "not-allowed" : "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
        onTouchStart={(e) => { if (!outOfStock) e.currentTarget.style.opacity = ".7"; }}
        onTouchEnd={(e)   => { e.currentTarget.style.opacity = "1"; }}
        onMouseEnter={(e) => { if (!outOfStock) e.currentTarget.style.opacity = ".85"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        {c.image ? (
          <img
            src={c.image}
            alt={c.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cream0)",
              fontSize: 11,
            }}
          >
            No Image
          </div>
        )}

        {/* Price badge */}
        <div
          style={{
            position: "absolute",
            top: 5, left: 5,
            background: "rgba(0,0,0,.75)",
            color: "var(--gold3)",
            padding: "2px 7px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ₹{Number(c.price).toFixed(0)}
        </div>

        {/* Stock badge */}
        <div
          style={{
            position: "absolute",
            top: 5, right: 5,
            background: outOfStock ? "var(--red-bg)" : "var(--green-bg)",
            color: outOfStock ? "var(--red)" : "var(--green)",
            padding: "2px 7px",
            borderRadius: 5,
            fontSize: 10,
            fontWeight: 600,
            border: `1px solid ${outOfStock ? "var(--red-border)" : "var(--green-border)"}`,
          }}
        >
          {outOfStock ? "OUT" : c.stock}
        </div>

        {/* Qty bubble */}
        {qty > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 5, right: 5,
              background: "var(--gold2)",
              color: "#000",
              width: mobile ? 26 : 30,
              height: mobile ? 26 : 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: mobile ? 14 : 16,
              boxShadow: "0 0 0 3px rgba(0,0,0,.7), 0 2px 8px rgba(0,0,0,.5)",
              border: "2px solid rgba(255,255,255,.9)",
              zIndex: 2,
            }}
          >
            {qty}
          </div>
        )}
      </div>

      {/* Name */}
      <div
        style={{
          padding: mobile ? "6px 8px 2px" : "8px 10px 4px",
          textAlign: "center",
          fontWeight: 600,
          fontSize,
          color: "var(--cream4)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {c.name}
      </div>

      {/* Minus — only when qty > 0 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: mobile ? 34 : 40,
          padding: mobile ? "4px 8px 8px" : "4px 10px 10px",
        }}
      >
        {qty > 0 ? (
          <button
            onClick={() => onChange(c, "REMOVE")}
            style={{
              width: mobile ? 28 : 34,
              height: mobile ? 28 : 34,
              borderRadius: mobile ? 7 : 10,
              border: "none",
              background: "var(--bg6)",
              color: "var(--cream2)",
              fontSize: mobile ? 16 : 20,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              minHeight: "unset",
              lineHeight: 1,
            }}
          >
            −
          </button>
        ) : (
          <span style={{ fontSize: 10, color: "var(--cream0)", opacity: 0.4 }}>
            tap to add
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Combo Grid ── */
export default function ComboGrid({ candies = [], offers = [], selected = [], onChange, mobile }) {
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
        : Number(c.price) <= 100
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
            No candies available for combos.
          </div>
        )}
      </div>
    </div>
  );
}
