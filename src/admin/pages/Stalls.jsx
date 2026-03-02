import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "../auth/adminFetch";
import API_URL from "../../config";

const API = `${API_URL}/api/admin/stalls`;

export default function Stalls() {
  const [stalls,       setStalls]       = useState([]);
  const [form,         setForm]         = useState({ name:"", company:"", location:"", salesman_name:"" });
  const [editSalesman, setEditSalesman] = useState({});
  const [linksLoading, setLinksLoading] = useState({});
  const navigate = useNavigate();

  const load = async () => {
    const r = await adminFetch(API);
    const d = await r.json();
    setStalls(Array.isArray(d) ? d : []);
  };
  useEffect(() => { load(); }, []);

  const createStall = async () => {
    if (!form.name || !form.company) return alert("Stall name and company are required.");
    await adminFetch(API, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    setForm({ name:"", company:"", location:"", salesman_name:"" });
    load();
  };

  const toggleStatus = async (s) => {
    await adminFetch(`${API}/${s.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ is_active: s.is_active ? 0 : 1 }) });
    load();
  };

  const removeStall = async (s) => {
    if (!window.confirm(`Remove "${s.name}"?\n\nSales history will be preserved.`)) return;
    await adminFetch(`${API}/${s.id}/archive`, { method:"PUT" });
    load();
  };

  const getEncLink = async (stallId) => {
    setLinksLoading(p => ({...p, [stallId]:true}));
    try {
      const r = await adminFetch(`${API_URL}/api/stall-token/${stallId}`);
      const d = await r.json();
      if (d.token) {
        await navigator.clipboard.writeText(`${window.location.origin}/salesman/${d.token}`);
        alert("🔒 Encrypted link copied to clipboard!");
      } else alert(d.error || "Failed to generate link");
    } catch { alert("Failed to generate link"); }
    finally { setLinksLoading(p => ({...p, [stallId]:false})); }
  };

  const saveSalesman = async (id) => {
    await adminFetch(`${API}/${id}/salesman`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ salesman_name: editSalesman[id] ?? "" }) });
    setEditSalesman(p => { const n = {...p}; delete n[id]; return n; });
    load();
  };

  return (
    <div style={{ maxWidth:900 }}>
      {/* ── Add form ── */}
      <div style={card}>
        <h3 style={cardH}>Add New Stall</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:12 }}>
          {[["name","Stall Name *","e.g. Main Stall"],["company","Company *","e.g. TCS Events"],["location","Location","e.g. Gate 2"],["salesman_name","Salesman Name","e.g. Rahul Kumar"]].map(([k,label,ph]) => (
            <div key={k}>
              <label style={lbl}>{label}</label>
              <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={ph}/>
            </div>
          ))}
        </div>
        <button onClick={createStall} style={goldBtn}>+ Add Stall</button>
      </div>

      <style>{`
        .stall-table { display:block }
        .stall-cards { display:none }
        @media(max-width:700px){
          .stall-table { display:none !important }
          .stall-cards { display:flex !important; flex-direction:column; gap:12px }
        }
      `}</style>

      {/* Desktop table */}
      <div className="stall-table" style={{ ...card, padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border0)" }}>
          <h3 style={{ ...cardH, margin:0 }}>All Stalls</h3>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table className="v-table" style={{ minWidth:640 }}>
            <thead><tr><th>#</th><th>Stall</th><th>Company</th><th>Location</th><th>Salesman</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {stalls.map(s => (
                <tr key={s.id}>
                  <td style={{ color:"var(--cream0)", fontSize:11 }}>#{s.id}</td>
                  <td style={{ fontWeight:600, color:"var(--cream4)" }}>{s.name}</td>
                  <td style={{ color:"var(--cream2)" }}>{s.company||"—"}</td>
                  <td style={{ color:"var(--cream1)", fontSize:12 }}>{s.location||"—"}</td>
                  <td><SalesmanCell s={s} editSalesman={editSalesman} setEditSalesman={setEditSalesman} saveSalesman={saveSalesman}/></td>
                  <td><span className={s.is_active?"badge badge-green":"badge badge-muted"}>{s.is_active?"Active":"Inactive"}</span></td>
                  <td><ActionBtns s={s} toggleStatus={toggleStatus} removeStall={removeStall} getEncLink={getEncLink} linksLoading={linksLoading} navigate={navigate}/></td>
                </tr>
              ))}
              {stalls.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--cream0)",padding:32}}>No stalls yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="stall-cards">
        {stalls.map(s => (
          <div key={s.id} style={{ background:"var(--bg3)", border:"1px solid var(--border1)", borderRadius:14, padding:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:"var(--cream4)" }}>{s.name}</div>
                <div style={{ fontSize:12, color:"var(--cream1)", marginTop:2 }}>{s.company}{s.location?` · ${s.location}`:""}</div>
              </div>
              <span className={s.is_active?"badge badge-green":"badge badge-muted"}>{s.is_active?"Active":"Inactive"}</span>
            </div>
            <div style={{ fontSize:12, color:"var(--cream1)", marginBottom:10 }}>
              <span style={{ color:"var(--cream0)" }}>Salesman: </span>
              <span style={{ color:"var(--cream3)", fontWeight:500 }}>{s.salesman_name||"Not set"}</span>
            </div>
            <ActionBtns s={s} toggleStatus={toggleStatus} removeStall={removeStall} getEncLink={getEncLink} linksLoading={linksLoading} navigate={navigate} mobile/>
          </div>
        ))}
        {stalls.length===0 && <p style={{color:"var(--cream0)",textAlign:"center",padding:24}}>No stalls yet.</p>}
      </div>
    </div>
  );
}

function SalesmanCell({ s, editSalesman, setEditSalesman, saveSalesman }) {
  const isEditing = s.id in editSalesman;
  if (isEditing) return (
    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
      <input value={editSalesman[s.id]} onChange={e=>setEditSalesman(p=>({...p,[s.id]:e.target.value}))}
        onKeyDown={e=>{ if(e.key==="Enter") saveSalesman(s.id); }}
        style={{ width:120, padding:"4px 8px", fontSize:12 }} autoFocus/>
      <button onClick={()=>saveSalesman(s.id)} style={iconBtn("var(--green-bg)","var(--green)")}>✓</button>
      <button onClick={()=>setEditSalesman(p=>{const n={...p};delete n[s.id];return n;})} style={iconBtn("var(--red-bg)","var(--red)")}>✕</button>
    </div>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ color:s.salesman_name?"var(--cream3)":"var(--cream0)", fontSize:13 }}>{s.salesman_name||"Not set"}</span>
      <button onClick={()=>setEditSalesman(p=>({...p,[s.id]:s.salesman_name||""}))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--cream0)", fontSize:12, padding:"2px 4px", minHeight:"unset" }}>✏️</button>
    </div>
  );
}

function ActionBtns({ s, toggleStatus, removeStall, getEncLink, linksLoading, navigate }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
      <button onClick={()=>toggleStatus(s)} style={smBtn}>{s.is_active?"Deactivate":"Activate"}</button>
      <button onClick={()=>navigate(`/admin/stalls/${s.id}`)} style={smBtn}>Manage</button>
      <button onClick={()=>getEncLink(s.id)} disabled={linksLoading[s.id]} style={{...smBtn, color:"var(--gold3)", borderColor:"rgba(200,132,42,.3)"}}>
        {linksLoading[s.id]?"…":"🔒 Copy Link"}
      </button>
      <button onClick={()=>removeStall(s)} style={dangerSmBtn}>Remove</button>
    </div>
  );
}

const card        = { background:"var(--bg3)", border:"1px solid var(--border1)", borderRadius:14, padding:18, marginBottom:16 };
const cardH       = { fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:17, color:"var(--cream4)", margin:"0 0 14px" };
const lbl         = { display:"block", fontSize:11, color:"var(--cream1)", fontWeight:500, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.04em" };
const goldBtn     = { padding:"9px 20px", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", color:"var(--bg0)", border:"none", borderRadius:9, cursor:"pointer", fontWeight:700, fontSize:13 };
const smBtn       = { padding:"6px 11px", background:"var(--bg5)", color:"var(--cream2)", border:"1px solid var(--border1)", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:600, minHeight:"unset" };
const dangerSmBtn = { padding:"6px 11px", background:"var(--red-bg)", color:"var(--red)", border:"1px solid var(--red-border)", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:600, minHeight:"unset" };
const iconBtn     = (bg,color) => ({ width:24, height:24, borderRadius:6, border:"none", background:bg, color, cursor:"pointer", fontSize:12, fontWeight:700, minHeight:"unset", padding:0, display:"flex", alignItems:"center", justifyContent:"center" });
