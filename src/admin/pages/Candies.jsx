import { useEffect, useState } from "react";
import { adminFetch } from "../auth/adminFetch";
import API_URL from "../../config";

const API      = `${API_URL}/api/admin/candies`;
const CAT_API  = `${API_URL}/api/admin/categories`;
const BASE_URL = API_URL;

const BADGE_COLORS = [
  { bg:"var(--blue-bg)",  color:"var(--blue)"     },
  { bg:"#1a0618",         color:"#e090c0"          },
  { bg:"var(--green-bg)", color:"var(--green)"     },
  { bg:"#1a0e00",         color:"var(--gold3)"     },
  { bg:"#18082a",         color:"var(--c-purple)"  },
  { bg:"#001a1c",         color:"#60d0e0"          },
  { bg:"#1a0800",         color:"#e08040"          },
];
const bc = idx => BADGE_COLORS[idx % BADGE_COLORS.length];

export default function Candies() {
  const [candies,    setCandies]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat,  setFilterCat]  = useState("ALL");

  /* add form */
  const [name,     setName]     = useState("");
  const [category, setCategory] = useState("");
  const [price,    setPrice]    = useState("");
  const [image,    setImage]    = useState(null);

  /* edit */
  const [editId,       setEditId]       = useState(null);
  const [editName,     setEditName]     = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice,    setEditPrice]    = useState("");
  const [editImage,    setEditImage]    = useState(null);

  /* cat modal */
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName,   setNewCatName]   = useState("");
  const [newCatPrefix, setNewCatPrefix] = useState("");
  const [catLoading,   setCatLoading]   = useState(false);

  const loadAll = async () => {
    const [cRes, catRes] = await Promise.all([
      adminFetch(API).then(r => r.json()),
      adminFetch(CAT_API).then(r => r.json()),
    ]);
    const cList   = Array.isArray(cRes)    ? cRes    : [];
    const catList = Array.isArray(catRes)  ? catRes  : [];
    setCandies(cList); setCategories(catList);
    if (!category   && catList.length) setCategory(catList[0].name);
    if (!editCategory && catList.length) setEditCategory(catList[0].name);
  };
  useEffect(() => { loadAll(); }, []);

  const uploadImage = async (id, file) => {
    const form = new FormData(); form.append("image", file);
    await adminFetch(`${API}/${id}/image`, { method:"POST", body:form });
  };

  const createCandy = async () => {
    if (!name.trim() || !price || !category) return alert("Name, category & price required");
    const res  = await adminFetch(API, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:name.trim(), category, price:Number(price) }) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed");
    if (image) await uploadImage(data.id, image);
    setName(""); setPrice(""); setImage(null); loadAll();
  };

  const deleteCandy = async (candy) => {
    if (!window.confirm(`Delete "${candy.name}"?\n\nIf it's in a candy list, it cannot be deleted — remove it from lists first.`)) return;
    const res  = await adminFetch(`${API}/${candy.id}`, { method:"DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to delete");
    loadAll();
  };

  const startEdit = c => { setEditId(c.id); setEditName(c.name); setEditCategory(c.category||categories[0]?.name||""); setEditPrice(c.price); setEditImage(null); };
  const saveEdit  = async id => {
    const res  = await adminFetch(`${API}/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:editName, category:editCategory, price:Number(editPrice) }) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed");
    if (editImage) await uploadImage(id, editImage);
    setEditId(null); loadAll();
  };

  const addCategory = async () => {
    if (!newCatName.trim() || !newCatPrefix.trim()) return alert("Name and prefix required");
    setCatLoading(true);
    const res  = await adminFetch(CAT_API, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:newCatName.trim(), prefix:newCatPrefix.trim().toUpperCase() }) });
    const data = await res.json(); setCatLoading(false);
    if (!res.ok) return alert(data.error || "Failed");
    setNewCatName(""); setNewCatPrefix(""); loadAll();
  };

  const deleteCategory = async cat => {
    if (!window.confirm(`Delete category "${cat.name}"?\nOnly works if no candies are in it.`)) return;
    const res  = await adminFetch(`${CAT_API}/${cat.id}`, { method:"DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed"); loadAll();
  };

  const displayed = filterCat === "ALL" ? candies : candies.filter(c => c.category === filterCat);

  return (
    <div style={{ maxWidth:960 }}>
      <style>{`
        /* ── responsive candy grid ── */
        .candy-grid { grid-template-columns: repeat(auto-fill, minmax(180px,1fr)) !important; }
        @media(max-width:540px){
          .candy-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-header { flex-direction: column !important; align-items: stretch !important; }
          .cat-header button { width: 100% }
        }
        /* category row in modal — stack on mobile */
        .cat-row { flex-wrap: nowrap }
        @media(max-width:480px){
          .cat-row { flex-wrap: wrap !important; gap: 6px !important; }
          .cat-row .cat-meta { flex-wrap: wrap }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="cat-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:10 }}>
        <h2 style={{ margin:0, fontSize:"1.2rem" }}>🍫 Candy Master</h2>
        <button onClick={() => setShowCatModal(true)} style={ghostBtn}>⚙️ Manage Categories</button>
      </div>

      {/* ── Add form ── */}
      <div style={card}>
        <div style={{ fontWeight:700, marginBottom:10, fontSize:14, color:"var(--cream4)" }}>➕ Add New Candy</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8, marginBottom:10 }}>
          <input placeholder="Candy name" value={name} onChange={e=>setName(e.target.value)}/>
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            {categories.map(c=><option key={c.id} value={c.name}>{c.name} ({c.prefix})</option>)}
          </select>
          <input type="number" placeholder="Price ₹" value={price} onChange={e=>setPrice(e.target.value)}/>
          <label style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 10px", background:"var(--bg3)", borderRadius:9, border:"1px solid var(--border1)", fontSize:13, color:"var(--cream1)", cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden" }}>
            📷 <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {image ? image.name.substring(0,14)+"…" : "Upload Image"}
            </span>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>setImage(e.target.files[0])}/>
          </label>
        </div>
        <button onClick={createCandy} style={goldBtn}>+ Add Candy</button>
      </div>

      {/* ── Category filter ── */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        <button onClick={()=>setFilterCat("ALL")} style={{ ...pill, background:filterCat==="ALL"?"var(--gold2)":"transparent", color:filterCat==="ALL"?"var(--bg0)":"var(--cream1)", borderColor:filterCat==="ALL"?"var(--gold2)":"var(--border1)" }}>
          All ({candies.length})
        </button>
        {categories.map((cat, idx) => {
          const b = bc(idx); const count = candies.filter(c=>c.category===cat.name).length;
          const on = filterCat === cat.name;
          return (
            <button key={cat.id} onClick={()=>setFilterCat(cat.name)} style={{ ...pill, background:on?b.color:"transparent", color:on?"var(--bg0)":b.color, borderColor:b.color }}>
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Candy cards ── */}
      <div className="candy-grid" style={{ display:"grid", gap:12 }}>
        {displayed.map((c, idx) => {
          const catIdx   = categories.findIndex(cat => cat.name === c.category);
          const b        = bc(catIdx >= 0 ? catIdx : 0);
          const isEditing = editId === c.id;

          return (
            <div key={c.id} style={{ background:"var(--bg3)", borderRadius:13, border:"1px solid var(--border1)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
              {/* Image */}
              <div style={{ position:"relative", width:"100%", paddingTop:"75%", background:"var(--bg5)", flexShrink:0 }}>
                {c.image
                  ? <img src={c.image?.startsWith('data:') ? c.image : `${BASE_URL}${c.image}`} alt={c.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--cream0)", fontSize:11 }}>No Image</div>
                }
                {!isEditing && (
                  <div style={{ position:"absolute", top:6, left:6, background:b.bg, color:b.color, padding:"2px 7px", borderRadius:20, fontSize:10, fontWeight:700, maxWidth:"55%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {c.category || "—"}
                  </div>
                )}
                {!isEditing && c.code && (
                  <div style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,.6)", color:"var(--cream3)", padding:"2px 6px", borderRadius:20, fontSize:9, fontWeight:600 }}>
                    {c.code}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding:"10px 10px 12px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                {isEditing ? (
                  <>
                    <input value={editName}     onChange={e=>setEditName(e.target.value)}     placeholder="Name"  style={{ fontSize:12, padding:"6px 8px" }}/>
                    <select value={editCategory} onChange={e=>setEditCategory(e.target.value)} style={{ fontSize:12, padding:"6px 8px" }}>
                      {categories.map(cat=><option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} placeholder="Price" style={{ fontSize:12, padding:"6px 8px" }}/>
                    <label style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 8px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border1)", fontSize:11, color:"var(--cream1)", cursor:"pointer" }}>
                      📷 {editImage?"Selected":"Change image"}
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>setEditImage(e.target.files[0])}/>
                    </label>
                    <div style={{ display:"flex", gap:6, marginTop:2 }}>
                      <button onClick={()=>saveEdit(c.id)} style={{ ...goldBtn, flex:1, padding:"7px", fontSize:12 }}>Save</button>
                      <button onClick={()=>setEditId(null)}  style={{ ...ghostBtn, flex:1, padding:"7px", fontSize:12 }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight:600, fontSize:13, color:"var(--cream4)", lineHeight:1.3 }}>{c.name}</div>
                    <div style={{ fontWeight:800, fontSize:15, color:"var(--gold3)", fontFamily:"'Cormorant Garamond',serif" }}>₹{Number(c.price).toFixed(0)}</div>
                    <div style={{ display:"flex", gap:6, marginTop:"auto" }}>
                      <button onClick={()=>startEdit(c)} style={{ ...goldBtn, flex:1, padding:"7px", fontSize:12 }}>✏️ Edit</button>
                      <button onClick={()=>deleteCandy(c)} style={{ width:32, height:32, borderRadius:8, background:"var(--red-bg)", border:"1px solid var(--red-border)", color:"var(--red)", cursor:"pointer", fontSize:14, minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }} title="Delete candy">🗑</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && (
        <p style={{ color:"var(--cream0)", textAlign:"center", marginTop:40, fontSize:13 }}>
          {filterCat==="ALL" ? "No candies yet." : `No candies in "${filterCat}".`}
        </p>
      )}

      {/* ── Category Modal ── */}
      {showCatModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000, padding:"0 0" }}
          onClick={()=>setShowCatModal(false)}>
          <div style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:"18px 18px 0 0", padding:"20px 16px 36px", width:"100%", maxWidth:560, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 -16px 50px rgba(0,0,0,.6)" }}
            onClick={e=>e.stopPropagation()}>

            {/* Handle */}
            <div style={{ width:36, height:4, borderRadius:99, background:"var(--border2)", margin:"0 auto 16px" }}/>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:"1.05rem" }}>⚙️ Manage Categories</h3>
              <button onClick={()=>setShowCatModal(false)} style={{ background:"var(--bg5)", border:"1px solid var(--border1)", width:30, height:30, borderRadius:8, color:"var(--cream1)", fontSize:14, cursor:"pointer", minHeight:"unset", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            {/* Existing categories */}
            <div style={{ marginBottom:18 }}>
              {categories.length===0 && <p style={{ color:"var(--cream0)", fontSize:13 }}>No categories yet.</p>}
              {categories.map((cat, idx) => {
                const b = bc(idx);
                const count = candies.filter(c=>c.category===cat.name).length;
                return (
                  <div key={cat.id} className="cat-row" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:11, marginBottom:7, background:"var(--bg4)", border:"1px solid var(--border1)", gap:8 }}>
                    <div className="cat-meta" style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flex:1, minWidth:0 }}>
                      <span style={{ background:b.bg, color:b.color, padding:"3px 10px", borderRadius:20, fontWeight:700, fontSize:12, whiteSpace:"nowrap" }}>{cat.name}</span>
                      <span style={{ fontSize:11, color:"var(--cream0)", background:"var(--bg2)", padding:"2px 7px", borderRadius:9, whiteSpace:"nowrap" }}>Prefix: {cat.prefix}</span>
                      <span style={{ fontSize:11, color:"var(--cream0)", whiteSpace:"nowrap" }}>{count} candies</span>
                    </div>
                    <button onClick={()=>deleteCategory(cat)} style={{ background:"var(--red-bg)", color:"var(--red)", border:"1px solid var(--red-border)", borderRadius:8, padding:"5px 11px", cursor:"pointer", fontWeight:700, fontSize:12, minHeight:"unset", whiteSpace:"nowrap", flexShrink:0 }}>
                      🗑 Delete
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add new */}
            <div style={{ background:"var(--bg2)", borderRadius:12, padding:14, border:"1px solid var(--border0)" }}>
              <div style={{ fontWeight:700, marginBottom:10, fontSize:14, color:"var(--cream4)" }}>➕ Add New Category</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <div>
                  <label style={lbl}>Category Name</label>
                  <input placeholder="e.g. White, Nutty…" value={newCatName} onChange={e=>setNewCatName(e.target.value)}/>
                </div>
                <div>
                  <label style={lbl}>Prefix (2-3 letters)</label>
                  <input placeholder="e.g. WC" value={newCatPrefix} onChange={e=>setNewCatPrefix(e.target.value.toUpperCase())} maxLength={3}/>
                </div>
              </div>
              <button onClick={addCategory} disabled={catLoading} style={{ ...goldBtn, width:"100%" }}>
                {catLoading ? "Adding…" : "+ Add Category"}
              </button>
              <p style={{ fontSize:11, color:"var(--cream0)", marginTop:8, marginBottom:0, lineHeight:1.5 }}>
                Prefix auto-generates candy codes (e.g. "WC" → WC1, WC2, WC3…)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const card    = { background:"var(--bg3)", borderRadius:12, padding:14, marginBottom:16, border:"1px solid var(--border1)" };
const lbl     = { display:"block", fontSize:11, color:"var(--cream1)", fontWeight:500, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.04em" };
const goldBtn = { padding:"8px 16px", background:"linear-gradient(135deg,var(--gold2),var(--gold3))", color:"var(--bg0)", border:"none", borderRadius:9, cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:5, whiteSpace:"nowrap" };
const ghostBtn= { padding:"8px 14px", background:"var(--bg5)", color:"var(--cream2)", border:"1px solid var(--border1)", borderRadius:9, cursor:"pointer", fontWeight:600, fontSize:13, whiteSpace:"nowrap" };
const pill    = { padding:"5px 12px", borderRadius:20, border:"1px solid", cursor:"pointer", fontWeight:600, fontSize:12, transition:"all .12s", minHeight:"unset" };