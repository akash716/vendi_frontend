import { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import API_URL from "../../config";

const LISTS_API = `${API_URL}/api/admin/offer-lists`;
const RULES_API = `${API_URL}/api/admin/combo-offer-rules`;

/* ─── Tiny sub-components ─── */
function Label({children}) {
  return <div style={{fontSize:11,fontWeight:600,color:"var(--cream1)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{children}</div>;
}
function FieldWrap({children}) {
  return <div style={{marginBottom:14}}>{children}</div>;
}
function StatusPill({active}) {
  return (
    <span className={active?"badge badge-green":"badge badge-muted"} style={{fontSize:10}}>
      {active?"● Active":"○ Inactive"}
    </span>
  );
}

export default function Offers() {
  const [lists,        setLists]        = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [rules,        setRules]        = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [newListName,  setNewListName]  = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [comboSize,    setComboSize]    = useState(3);
  const [offerPrice,   setOfferPrice]   = useState("");
  const [comboType,    setComboType]    = useState("SAME");
  const [priceOn,      setPriceOn]      = useState("");
  const [priceRows,    setPriceRows]    = useState([{price:"",qty:""}]);

  const loadLists = async () => {
    try { setLists((await adminFetch(LISTS_API).then(r=>r.json())) || []); }
    catch { alert("Failed to load offer lists"); }
  };
  const loadRules = async (id) => {
    setLoadingRules(true);
    try { setRules((await adminFetch(`${RULES_API}?offer_list_id=${id}`).then(r=>r.json())).rules || []); }
    catch { setRules([]); }
    finally { setLoadingRules(false); }
  };
  useEffect(()=>{loadLists();},[]);
  useEffect(()=>{ if(selectedList) loadRules(selectedList.id); },[selectedList]);

  const createList = async () => {
    if(!newListName.trim()) return alert("Name required");
    setCreatingList(true);
    try {
      const r = await adminFetch(LISTS_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newListName.trim()})});
      const d = await r.json();
      if(!r.ok) throw new Error(d.error||"Failed");
      setNewListName(""); await loadLists();
    } catch(e){alert(e.message);}
    finally{setCreatingList(false);}
  };

  const deleteList = async (id) => {
    if(!window.confirm("Delete this offer list and all its rules?")) return;
    try {
      const r = await adminFetch(`${LISTS_API}/${id}`,{method:"DELETE"});
      if(!r.ok) throw new Error((await r.json()).error||"Failed");
      if(selectedList?.id===id){setSelectedList(null);setRules([]);}
      await loadLists();
    } catch(e){alert(e.message);}
  };

  const resetForm = () => {
    setEditingId(null);setComboSize(3);setOfferPrice("");
    setComboType("SAME");setPriceOn("");setPriceRows([{price:"",qty:""}]);
  };
  const editRule = (r) => {
    setEditingId(r.id); setComboSize(r.unique_count); setOfferPrice(r.offer_price);
    if(r.price!=null){setComboType("SAME");setPriceOn(r.price);setPriceRows([{price:"",qty:""}]);}
    else{setComboType("MIXED");setPriceRows(r.price_pattern?.length?r.price_pattern.map(p=>({price:p.price,qty:p.qty})):[{price:"",qty:""}]);}
    document.getElementById("rule-form")?.scrollIntoView({behavior:"smooth"});
  };

  const saveRule = async () => {
    if(!selectedList) return alert("Select an offer list first");
    if(!offerPrice)   return alert("Offer price required");
    if(!comboSize||Number(comboSize)<=0) return alert("Combo size must be > 0");
    const payload = { offer_list_id:selectedList.id, unique_count:Number(comboSize), offer_price:Number(offerPrice), price:null, price_pattern:null };
    if(comboType==="SAME"){
      if(!priceOn) return alert("Candy price required");
      payload.price = Number(priceOn);
    } else {
      const cleaned = priceRows.map(r=>({price:Number(r.price),qty:Number(r.qty)})).filter(r=>r.price&&r.qty);
      const totalQty = cleaned.reduce((s,r)=>s+r.qty,0);
      if(totalQty!==Number(comboSize)) return alert(`Pattern qty (${totalQty}) must equal combo size (${comboSize})`);
      payload.price_pattern = cleaned;
    }
    try {
      const url = editingId?`${RULES_API}/${editingId}`:RULES_API;
      const r = await adminFetch(url,{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!r.ok) throw new Error((await r.json()).error||"Save failed");
      resetForm(); await loadRules(selectedList.id);
    } catch(e){alert(e.message);}
  };

  const toggleStatus = async (r) => {
    try {
      const res = await adminFetch(`${RULES_API}/${r.id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({is_active:r.is_active?0:1})});
      if(!res.ok) throw new Error((await res.json()).error||"Failed");
      setRules(prev=>prev.map(x=>x.id===r.id?{...x,is_active:r.is_active?0:1}:x));
    } catch(e){alert(e.message);}
  };

  const permanentDelete = async (id) => {
    if(!window.confirm("Permanently delete this rule? This cannot be undone.")) return;
    try {
      const r = await adminFetch(`${RULES_API}/${id}/permanent`,{method:"DELETE"});
      if(!r.ok) throw new Error((await r.json()).error||"Failed");
      setRules(prev=>prev.filter(x=>x.id!==id));
      if(editingId===id) resetForm();
    } catch(e){alert(e.message);}
  };

  return (
    <div style={{maxWidth:1100}}>
      <style>{`
        @media(max-width:760px){
          .offer-grid { grid-template-columns: 1fr !important; }
          .offer-list-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      {/* ── Create list ── */}
      <div style={sCard}>
        <h3 style={{margin:"0 0 14px"}}>Offer Lists</h3>
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          <input value={newListName} onChange={e=>setNewListName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&createList()}
            placeholder="New offer list name…"/>
          <button onClick={createList} disabled={creatingList} className="btn-gold" style={{whiteSpace:"nowrap",padding:"9px 20px"}}>
            {creatingList?"Creating…":"+ Create"}
          </button>
        </div>

        {lists.length===0 && <p style={{color:"var(--cream0)",fontSize:13}}>No offer lists yet.</p>}

        <div className="offer-list-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {lists.map(l=>(
            <div key={l.id} onClick={()=>setSelectedList(l)} style={{
              display:"flex",alignItems:"center",gap:10,
              padding:"12px 14px", borderRadius:10, cursor:"pointer",
              border:`1.5px solid ${selectedList?.id===l.id?"var(--gold2)":"var(--border1)"}`,
              background: selectedList?.id===l.id?"var(--bg5)":"var(--bg4)",
              transition:"all .15s",
            }}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:"var(--cream4)",fontSize:14}}>{l.name}</div>
                <div style={{color:"var(--cream0)",fontSize:11,marginTop:2}}>ID #{l.id}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();deleteList(l.id);}} className="btn-danger"
                style={{padding:"5px 9px",fontSize:13,minHeight:"unset"}}>🗑</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rules section ── */}
      {selectedList && (
        <div style={{marginTop:24}}>
          <h3 style={{marginBottom:16}}>
            Rules — <span style={{fontWeight:400,color:"var(--gold3)"}}>{selectedList.name}</span>
          </h3>

          <div className="offer-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,360px) 1fr",gap:16,alignItems:"start",flexWrap:"wrap"}}>
            {/* FORM */}
            <div id="rule-form" style={sCard}>
              <h4 style={{margin:"0 0 16px",color:"var(--cream4)"}}>
                {editingId?"✏️ Edit Rule":"＋ New Rule"}
              </h4>

              <FieldWrap>
                <div style={{display:"flex",gap:18,marginBottom:2}}>
                  {["SAME","MIXED"].map(t=>(
                    <label key={t} style={{display:"flex",gap:7,alignItems:"center",cursor:"pointer",color:comboType===t?"var(--cream4)":"var(--cream1)",fontWeight:comboType===t?600:400}}>
                      <input type="radio" checked={comboType===t} onChange={()=>setComboType(t)} style={{width:"auto",accentColor:"var(--gold2)"}}/>
                      {t==="SAME"?"Same Price":"Mixed Price"}
                    </label>
                  ))}
                </div>
              </FieldWrap>

              <FieldWrap>
                <Label>Combo Size</Label>
                <input type="number" min="1" value={comboSize} onChange={e=>setComboSize(e.target.value)} placeholder="e.g. 3"/>
              </FieldWrap>

              {comboType==="SAME" && (
                <FieldWrap>
                  <Label>Candy Price (₹)</Label>
                  <input type="number" value={priceOn} onChange={e=>setPriceOn(e.target.value)} placeholder="e.g. 65"/>
                </FieldWrap>
              )}
              {comboType==="MIXED" && (
                <FieldWrap>
                  <Label>Price Pattern</Label>
                  {priceRows.map((r,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:8}}>
                      <input type="number" placeholder="Price ₹" value={r.price}
                        onChange={e=>{const n=[...priceRows];n[i].price=e.target.value;setPriceRows(n);}}/>
                      <input type="number" placeholder="Qty" value={r.qty}
                        onChange={e=>{const n=[...priceRows];n[i].qty=e.target.value;setPriceRows(n);}}/>
                      <button className="btn-danger" style={{padding:"6px 10px",minHeight:"unset"}}
                        onClick={()=>{const n=priceRows.filter((_,j)=>j!==i);setPriceRows(n.length?n:[{price:"",qty:""}]);}}>✕</button>
                    </div>
                  ))}
                  <button onClick={()=>setPriceRows([...priceRows,{price:"",qty:""}])}
                    className="btn-ghost" style={{padding:"6px 14px",fontSize:12,minHeight:"unset",marginTop:2}}>+ Add Row</button>
                </FieldWrap>
              )}

              <FieldWrap>
                <Label>Offer Price (₹)</Label>
                <input type="number" value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} placeholder="e.g. 180"/>
              </FieldWrap>

              <div style={{display:"flex",gap:8}}>
                <button className="btn-gold" style={{flex:1,padding:"10px"}} onClick={saveRule}>
                  {editingId?"Update Rule":"Save Rule"}
                </button>
                {editingId && <button className="btn-ghost" style={{padding:"10px 16px"}} onClick={resetForm}>Cancel</button>}
              </div>
            </div>

            {/* RULES LIST */}
            <div>
              {loadingRules && <p style={{color:"var(--cream0)",fontSize:13}}>Loading rules…</p>}
              {!loadingRules && rules.length===0 && (
                <div style={{padding:20,textAlign:"center",borderRadius:10,border:"1px dashed var(--border2)",color:"var(--cream0)",fontSize:13}}>
                  No rules yet. Create one using the form.
                </div>
              )}
              {rules.map(r=>(
                <div key={r.id} style={{
                  display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                  padding:"14px 16px",borderRadius:11,marginBottom:10,
                  border:`1px solid ${r.is_active?"var(--border2)":"var(--border0)"}`,
                  background: r.is_active?"var(--bg4)":"var(--bg3)",
                  opacity: r.is_active?1:.6,
                  transition:"opacity .15s",
                }}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:"var(--cream4)"}}>
                      Pick {r.unique_count}{" "}
                      {r.price!=null
                        ? <span style={{background:"var(--bg5)",color:"var(--gold3)",padding:"1px 8px",borderRadius:6,fontSize:12,fontWeight:600}}>@ ₹{r.price}</span>
                        : <span style={{background:"var(--blue-bg)",color:"var(--blue)",padding:"1px 8px",borderRadius:6,fontSize:12,fontWeight:600}}>Mixed</span>
                      }
                    </div>
                    {r.price_pattern?.length>0 && (
                      <div style={{fontSize:12,color:"var(--cream1)",marginBottom:6}}>
                        {r.price_pattern.map((p,i)=><span key={i} style={{marginRight:8}}>{p.qty}×₹{p.price}</span>)}
                      </div>
                    )}
                    <div style={{fontSize:14,color:"var(--cream3)"}}>
                      Offer price: <strong style={{color:"var(--green)"}}>₹{r.offer_price}</strong>
                    </div>
                    <div style={{marginTop:8}}><StatusPill active={r.is_active}/></div>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:6,marginLeft:12}}>
                    <button className="btn-gold" style={{padding:"6px 14px",minHeight:"unset"}} onClick={()=>editRule(r)}>Edit</button>
                    <button className="btn-ghost" style={{padding:"6px 14px",minHeight:"unset",color:r.is_active?"var(--red)":"var(--green)"}} onClick={()=>toggleStatus(r)}>
                      {r.is_active?"Pause":"Activate"}
                    </button>
                    <button className="btn-danger" style={{padding:"6px 14px",minHeight:"unset"}} onClick={()=>permanentDelete(r.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sCard = {background:"var(--bg3)",border:"1px solid var(--border1)",borderRadius:13,padding:20,marginBottom:16};
