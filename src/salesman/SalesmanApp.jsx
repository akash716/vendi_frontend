import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useSalesmanConfig from "./hooks/useSalesmanConfig";
import Tabs from "./components/Tabs";
import SingleGrid from "./components/SingleGrid";
import ComboGrid from "./components/ComboGrid";
import BigComboGrid from "./components/BigComboGrid";
import Cart from "./components/Cart";
import ComboSizePopup from "./components/ComboSizePopup";
import SalesmanProfile from "./components/SalesmanProfile";
import API_URL from "../config";

const SMALL_MAX = 100;
const API = API_URL;

export default function SalesmanApp() {
  const { token }    = useParams();          // encrypted token from URL
  const navigate     = useNavigate();
  const [stallId,    setStallId]    = useState(null);
  const [tokenError, setTokenError] = useState(null);
  // Resolve encrypted token → stallId
  useEffect(() => {
    if (!token) { setTokenError("Invalid link"); return; }
    fetch(`${API}/api/stall-token/resolve/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setTokenError(data.error);
        else setStallId(data.stallId);
      })
      .catch(() => setTokenError("Failed to verify stall link"));
  }, [token]);

  const { config, candies, reloadCandies, loading } = useSalesmanConfig(stallId);

  const [tab,              setTab]              = useState("SINGLE");
  const [singleKey,        setSingleKey]        = useState(0);
  const [cart,             setCart]             = useState([]);
  const [comboBuffer,      setComboBuffer]      = useState([]);
  const [showComboPopup,   setShowComboPopup]   = useState(false);
  const [selectedComboSize,setSelectedComboSize]= useState(null);
  const [showProfile,      setShowProfile]      = useState(false);
  const [showCart,         setShowCart]         = useState(false);
  const [isMobile,         setIsMobile]         = useState(window.innerWidth < 1000);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const smallComboOffers = useMemo(() => {
    if (!config?.offers) return [];
    return config.offers.filter(o => {
      if (o.price != null) return Number(o.price) <= SMALL_MAX;
      if (Array.isArray(o.price_pattern) && o.price_pattern.length)
        return o.price_pattern.every(p => Number(p.price) <= SMALL_MAX);
      return false;
    });
  }, [config]);

  const bigComboOffers = useMemo(() => {
    if (!config?.offers) return [];
    return config.offers.filter(o => {
      if (o.price != null) return Number(o.price) > SMALL_MAX;
      if (Array.isArray(o.price_pattern) && o.price_pattern.length)
        return o.price_pattern.every(p => Number(p.price) > SMALL_MAX);
      return false;
    });
  }, [config]);

  const comboSizes = useMemo(() =>
    [...new Set(smallComboOffers.map(o => Number(o.unique_count)))].filter(Boolean).sort((a,b)=>a-b),
    [smallComboOffers]);

  const BIG_COMBO_SIZE = useMemo(() => {
    const s = [...new Set(bigComboOffers.map(o => Number(o.unique_count)))].filter(Boolean).sort((a,b)=>a-b);
    return s[0] || 3;
  }, [bigComboOffers]);

  const cartItemCount = cart.reduce((s,l) => s + (l.items?.length || 1), 0);

  // Token error screen — after all hooks
  if (tokenError) return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14, padding:24 }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"var(--cream4)", fontWeight:700 }}>Invalid Link</div>
      <div style={{ color:"var(--red)", fontSize:14, textAlign:"center", maxWidth:300 }}>{tokenError}</div>
      <div style={{ color:"var(--cream0)", fontSize:12, textAlign:"center", marginTop:4 }}>Contact your admin for a valid dashboard link.</div>
    </div>
  );

  // Waiting for token resolution
  if (!stallId) return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:40 }}>🍫</div>
      <div style={{ color:"var(--cream1)", fontSize:14 }}>Verifying link…</div>
    </div>
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--bg1)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:42 }}>🍫</div>
      <div style={{ color:"var(--cream1)", fontSize:14, fontFamily:"'Inter',sans-serif" }}>Loading…</div>
    </div>
  );

  if (!config) return (
    <div style={{ minHeight:"100vh", background:"var(--bg1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"var(--red)", fontSize:14 }}>Error loading config</div>
    </div>
  );

  /* ─── handlers ─── */
  function handleSingleSelect(item) {
    if (item.stock <= 0) return alert("Out of stock");
    setCart(prev => [...prev, { type:"ITEM", price:Number(item.price), items:[{ candy_id:item.id, name:item.name, price:Number(item.price), qty:1 }] }]);
  }

  function getPriceCount(items) {
    const map = {};
    items.forEach(c => { const p = Number(c.price); map[p] = (map[p]||0)+1; });
    return map;
  }

  function findMatchingOffer(selected, limit, pool) {
    const count = getPriceCount(selected);
    for (const o of pool) {
      if (Number(o.unique_count) !== Number(limit)) continue;
      if (o.price !== null || !Array.isArray(o.price_pattern)) continue;
      let ok=true, pt=0;
      for (const p of o.price_pattern) {
        pt += Number(p.qty);
        if ((count[Number(p.price)]||0) !== Number(p.qty)) { ok=false; break; }
      }
      if (ok && pt === Number(limit)) return o;
    }
    for (const o of pool) {
      if (Number(o.unique_count) !== Number(limit)) continue;
      if (o.price === null) continue;
      const key = Number(o.price);
      const tot = Object.values(count).reduce((s,v)=>s+v,0);
      if ((count[key]||0) === Number(o.unique_count) && tot === Number(o.unique_count)) return o;
    }
    return null;
  }

  function updateCombo(candy, action) {
    const limit = tab === "BIG_COMBO" ? BIG_COMBO_SIZE : selectedComboSize;
    if (!limit) return;
    let next = [...comboBuffer];
    if (action === "REMOVE") {
      const idx = next.findIndex(c => c.id === candy.id);
      if (idx !== -1) next.splice(idx,1);
      setComboBuffer(next); return;
    }
    if (action === "ADD") {
      if (next.length >= limit) return;
      next.push(candy);
      setComboBuffer(next);
    }
    if (next.length === limit) {
      const pool = tab === "BIG_COMBO" ? bigComboOffers : smallComboOffers;
      const offer = findMatchingOffer(next, limit, pool);
      if (!offer) return;
      setCart(prev => [...prev, { type:"COMBO", source:tab, offer_id:offer.id, price:Number(offer.offer_price), items:next.map(c=>({ candy_id:c.id, name:c.name, price:Number(c.price), qty:1 })) }]);
      setComboBuffer([]);
    }
  }

  function onSaleComplete() {
    reloadCandies(); setCart([]); setComboBuffer([]); setSelectedComboSize(null);
  }

  /* ─── render ─── */
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg1)", fontFamily:"'Inter',sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background:"var(--bg0)", borderBottom:"1px solid var(--border0)",
        padding: isMobile ? "0 12px" : "0 18px",
        height:52, display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🍫</span>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:isMobile?16:18, color:"var(--cream4)" }}>Vendi</span>
          {config?.stall?.name && (
            <span style={{ fontSize:11, color:"var(--cream0)", background:"var(--bg3)", padding:"2px 8px", borderRadius:99, border:"1px solid var(--border0)", maxWidth: isMobile ? 100 : 200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {config.stall.name}
            </span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Mobile: cart count badge on top bar */}
          {isMobile && cartItemCount > 0 && (
            <button onClick={() => setShowCart(true)} style={{
              background:"linear-gradient(135deg,var(--gold2),var(--gold3))",
              border:"none", borderRadius:9, padding:"6px 12px",
              color:"var(--bg0)", fontWeight:800, fontSize:13, cursor:"pointer", minHeight:"unset",
              display:"flex", alignItems:"center", gap:5,
            }}>
              🛒 <span style={{ background:"var(--bg0)", color:"var(--gold3)", borderRadius:99, width:18, height:18, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>{cartItemCount}</span>
            </button>
          )}
          <button onClick={() => setShowProfile(true)} style={{
            width:36, height:36, borderRadius:"50%",
            background:"linear-gradient(135deg,var(--gold2),var(--gold3))",
            border:"none", cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--bg0)", minHeight:"unset", padding:0,
            boxShadow:"0 2px 10px rgba(200,132,42,.35)",
          }}>👤</button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      {isMobile ? (
        /* MOBILE: full width single column */
        <div style={{ padding:"12px 10px 100px" }}>
          <Tabs active={tab} onChange={t => {
            if (t==="COMBO") { setShowComboPopup(true); setTab("COMBO"); }
            else if (t==="BIG_COMBO") { setSelectedComboSize(BIG_COMBO_SIZE); setComboBuffer([]); setTab("BIG_COMBO"); }
            else { setSelectedComboSize(null); setComboBuffer([]); setTab("SINGLE"); setSingleKey(k=>k+1); }
          }}/>
          {tab==="SINGLE" && <SingleGrid key={singleKey} candies={candies} onSelect={handleSingleSelect} mobile />}
          {tab==="COMBO" && selectedComboSize && <ComboGrid candies={candies} offers={smallComboOffers} selected={comboBuffer} onChange={updateCombo} mobile />}
          {tab==="BIG_COMBO" && <BigComboGrid candies={candies} offers={bigComboOffers} selected={comboBuffer} onChange={updateCombo} mobile />}
        </div>
      ) : (
        /* DESKTOP: two-column */
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:14, padding:"14px 16px", maxWidth:1300, margin:"0 auto", alignItems:"start" }}>
          <div>
            <Tabs active={tab} onChange={t => {
              if (t==="COMBO") { setShowComboPopup(true); setTab("COMBO"); }
              else if (t==="BIG_COMBO") { setSelectedComboSize(BIG_COMBO_SIZE); setComboBuffer([]); setTab("BIG_COMBO"); }
              else { setSelectedComboSize(null); setComboBuffer([]); setTab("SINGLE"); setSingleKey(k=>k+1); }
            }}/>
            {tab==="SINGLE" && <SingleGrid key={singleKey} candies={candies} onSelect={handleSingleSelect} />}
            {tab==="COMBO" && selectedComboSize && <ComboGrid candies={candies} offers={smallComboOffers} selected={comboBuffer} onChange={updateCombo} />}
            {tab==="BIG_COMBO" && <BigComboGrid candies={candies} offers={bigComboOffers} selected={comboBuffer} onChange={updateCombo} />}
          </div>
          <div style={{ position:"sticky", top:66 }}>
            <Cart cart={cart} setCart={setCart} stallId={stallId} onSaleComplete={onSaleComplete} />
          </div>
        </div>
      )}

      {/* ── MOBILE: Fixed checkout bar ── */}
      {isMobile && cartItemCount > 0 && !showCart && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:300, padding:"10px 12px 16px", background:"linear-gradient(to top, var(--bg0) 70%, transparent)" }}>
          <button onClick={() => setShowCart(true)} style={{
            width:"100%", padding:"14px",
            borderRadius:14, border:"none",
            background:"linear-gradient(135deg,var(--gold2),var(--gold3))",
            color:"var(--bg0)", fontWeight:800, fontSize:16,
            boxShadow:"0 4px 24px rgba(200,132,42,.5)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            🛒 View Cart · {cartItemCount} item{cartItemCount>1?"s":""}
            <span style={{ background:"var(--bg0)", color:"var(--gold3)", padding:"2px 10px", borderRadius:99, fontSize:14, fontWeight:800 }}>
              Checkout →
            </span>
          </button>
        </div>
      )}

      {/* ── MOBILE CART SHEET ── */}
      {showCart && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:400, display:"flex", alignItems:"flex-end" }}
          onClick={() => setShowCart(false)}>
          <div style={{ width:"100%", maxHeight:"88vh", borderRadius:"20px 20px 0 0", overflow:"hidden", background:"var(--bg2)", border:"1px solid var(--border1)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"10px 0 6px", display:"flex", justifyContent:"center" }}>
              <div style={{ width:36, height:4, borderRadius:99, background:"var(--border2)" }} />
            </div>
            <Cart cart={cart} setCart={setCart} stallId={stallId} onSaleComplete={() => { onSaleComplete(); setShowCart(false); }} />
          </div>
        </div>
      )}

      {/* ── COMBO SIZE POPUP ── */}
      <ComboSizePopup
        visible={showComboPopup}
        comboSizes={comboSizes}
        onSelect={size => { setSelectedComboSize(Number(size)); setComboBuffer([]); setShowComboPopup(false); }}
        onCancel={() => { setShowComboPopup(false); setTab("SINGLE"); }}
      />

      {/* ── PROFILE ── */}
      {showProfile && <SalesmanProfile stallId={stallId} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
