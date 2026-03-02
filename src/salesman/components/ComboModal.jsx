import React, { useState } from "react";

export default function ComboModal({ offer, candies, onClose, onAdd }) {
  const [selected, setSelected] = useState([]);

  const toggle = (c) => {
    if (c.stock <= 0) return;
    const exists = selected.some(i=>i.id===c.id);
    if (exists) { setSelected(selected.filter(i=>i.id!==c.id)); return; }
    if (selected.length >= offer.unique_count) return;
    setSelected([...selected,c]);
  };

  const complete = selected.length === offer.unique_count;

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:999 }}>
      <div style={{ background:"var(--bg3)",border:"1px solid var(--border2)",padding:24,width:420,borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,.6)" }}>
        <h3 style={{ margin:"0 0 16px",color:"var(--cream4)" }}>
          Pick {offer.unique_count} chocolates
        </h3>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
          {candies.filter(c=>Number(c.price)===Number(offer.price)).map(c=>{
            const active = selected.some(i=>i.id===c.id);
            return (
              <button key={c.id} onClick={()=>toggle(c)}
                disabled={c.stock<=0||(!active&&selected.length===offer.unique_count)}
                style={{
                  padding:"10px 8px", borderRadius:9,
                  border:`1.5px solid ${active?"var(--gold2)":"var(--border1)"}`,
                  background: active?"linear-gradient(135deg,var(--gold2),var(--gold3))":"var(--bg4)",
                  color: active?"var(--bg0)":"var(--cream3)",
                  fontWeight: active?700:400,
                  opacity: c.stock<=0?0.4:1,
                  transition:"all .15s",
                }}>
                <div style={{fontSize:13}}>{c.name}</div>
                <div style={{fontSize:11,marginTop:3,opacity:.8}}>₹{c.price}</div>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} className="btn-ghost" style={{flex:1,padding:"10px"}}>Cancel</button>
          <button disabled={!complete}
            className="btn-gold" style={{flex:2,padding:"10px"}}
            onClick={()=>onAdd({type:"COMBO",offer_id:offer.combo_offer_id,title:`Combo @ ₹${offer.offer_price}`,price:offer.offer_price,items:selected.map(c=>({candy_id:c.id,qty:1,price:c.price}))})}>
            Add Combo ₹{offer.offer_price}
          </button>
        </div>
      </div>
    </div>
  );
}
