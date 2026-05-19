import React from "react";
import API_URL from "../../config";
import useCandyImage from "../hooks/useCandyImage";

const BASE = API_URL;

/* ── Candy Card ── */
export function CandyCard({ c, qty, onChange, mobile }) {
  const outOfStock = (c.stock ?? 0) <= 0;
  const imgH     = mobile ? 100 : 130;
  const fontSize = mobile ? 12 : 14;
  const image    = useCandyImage(c.id);

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
      {/* Image */}
      <div style={{ height: imgH, position: "relative", background: "var(--bg5)", flexShrink: 0 }}>
        {image ? (
          <img
            src={
              image?.startsWith("data:") || image?.startsWith("http")
                ? image
                : `${BASE}${image}`
            }
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
            top: 5,
            left: 5,
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
            top: 5,
            right: 5,
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

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: mobile ? 8 : 12,
          padding: mobile ? "6px 8px 10px" : "8px 10px 12px",
        }}
      >
        <button
          onClick={() => onChange(c, "REMOVE")}
          disabled={qty === 0}
          style={ctrlBtn(qty === 0, "remove", mobile)}
        >
          −
        </button>
        <span
          style={{
            fontWeight: 800,
            fontSize: mobile ? 14 : 16,
            color: qty > 0 ? "var(--gold2)" : "var(--cream1)",
            minWidth: 14,
            textAlign: "center",
          }}
        >
          {qty}
        </span>
        <button
          onClick={() => onChange(c, "ADD")}
          disabled={outOfStock}
          style={ctrlBtn(outOfStock, "add", mobile)}
        >
          +
        </button>
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

  const list = candies
    .filter((c) =>
      validPrices.size > 0
        ? validPrices.has(Number(c.price))
        : Number(c.price) <= 100
    )
    .sort((a, b) =>
      Number(a.price) !== Number(b.price)
        ? Number(a.price) - Number(b.price)
        : (a.code || "").localeCompare(b.code || "", undefined, { numeric: true })
    );

  const priceGroups = React.useMemo(() => {
    const map = new Map();
    list.forEach((c) => {
      const key = Number(c.price);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return [...map.entries()];
  }, [list]);

  const countOf = (id) => selected.filter((c) => c.id === id).length;
  const gap = mobile ? 8 : 12;

  return (
    <div style={{ maxWidth: mobile ? "100%" : 520 }}>
      <p style={{ marginBottom: 12, color: "var(--cream1)", fontSize: 12 }}>
        Tap + / − to build your combo — applies automatically on completion.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 14 : 18 }}>
        {priceGroups.map(([price, group]) => (
          <div key={price}>
            {/* Price group header */}
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--gold3)",
                  background: "rgba(200,132,42,.12)",
                  border: "1px solid rgba(200,132,42,.2)",
                  padding: "2px 10px",
                  borderRadius: 99,
                }}
              >
                ₹{price}
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--border0)" }} />
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap }}>
              {chunk(group, 3).map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap }}
                >
                  {row.map((c) => (
                    <CandyCard
                      key={c.id}
                      c={c}
                      qty={countOf(c.id)}
                      onChange={onChange}
                      mobile={mobile}
                    />
                  ))}
                  {/* Fill empty slots */}
                  {row.length < 3 &&
                    Array.from({ length: 3 - row.length }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ visibility: "hidden" }} />
                    ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div
            style={{
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

/* ── Helpers ── */
function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function ctrlBtn(disabled, type, mobile) {
  const size = mobile ? 28 : 34;
  return {
    width: size,
    height: size,
    borderRadius: mobile ? 7 : 10,
    border: "none",
    background: disabled
      ? "var(--bg5)"
      : type === "add"
      ? "linear-gradient(135deg, var(--gold2), var(--gold3))"
      : "var(--bg6)",
    color: disabled ? "var(--cream0)" : type === "add" ? "var(--bg0)" : "var(--cream2)",
    fontSize: mobile ? 16 : 20,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    minHeight: "unset",
    lineHeight: 1,
    transition: "background .15s",
  };
}
