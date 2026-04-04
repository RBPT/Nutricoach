import { useState, useEffect, useCallback, useRef } from "react"

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_FOODS = [
  { id:1,  name:"Chicken Breast",     cal100:165, pro100:31,  carb100:0,    fat100:3.6, unit:"g" },
  { id:2,  name:"Brown Rice (cooked)",cal100:112, pro100:2.6, carb100:23.5, fat100:0.9, unit:"g" },
  { id:3,  name:"Egg",                cal100:143, pro100:12,  carb100:0.7,  fat100:10,  unit:"g", defaultGrams:50 },
  { id:4,  name:"Oats (dry)",         cal100:389, pro100:17,  carb100:66,   fat100:7,   unit:"g" },
  { id:5,  name:"Greek Yogurt",       cal100:59,  pro100:10,  carb100:3.5,  fat100:0.4, unit:"g", defaultGrams:170 },
  { id:6,  name:"Salmon",             cal100:208, pro100:20,  carb100:0,    fat100:13,  unit:"g" },
  { id:7,  name:"Banana",             cal100:89,  pro100:1.1, carb100:23,   fat100:0.3, unit:"g", defaultGrams:118 },
  { id:8,  name:"Broccoli",           cal100:34,  pro100:2.8, carb100:7,    fat100:0.4, unit:"g" },
  { id:9,  name:"Almonds",            cal100:579, pro100:21,  carb100:22,   fat100:50,  unit:"g", defaultGrams:30 },
  { id:10, name:"Sweet Potato",       cal100:86,  pro100:1.6, carb100:20,   fat100:0.1, unit:"g" },
  { id:11, name:"Whey Protein",       cal100:400, pro100:80,  carb100:10,   fat100:6.7, unit:"g", defaultGrams:30 },
  { id:12, name:"Avocado",            cal100:160, pro100:2,   carb100:9,    fat100:15,  unit:"g", defaultGrams:75 },
  { id:13, name:"Whole Milk",         cal100:61,  pro100:3.2, carb100:4.8,  fat100:3.3, unit:"ml",defaultGrams:240 },
  { id:14, name:"Tuna (canned)",      cal100:93,  pro100:21,  carb100:0,    fat100:0.7, unit:"g", defaultGrams:140 },
  { id:15, name:"White Rice (cooked)",cal100:130, pro100:2.7, carb100:28,   fat100:0.3, unit:"g" },
  { id:16, name:"Cottage Cheese",     cal100:98,  pro100:11,  carb100:3.4,  fat100:4.3, unit:"g" },
  { id:17, name:"Black Beans",        cal100:132, pro100:8.9, carb100:24,   fat100:0.5, unit:"g" },
  { id:18, name:"Peanut Butter",      cal100:588, pro100:25,  carb100:20,   fat100:50,  unit:"g", defaultGrams:32 },
  { id:19, name:"Orange",             cal100:47,  pro100:0.9, carb100:12,   fat100:0.1, unit:"g", defaultGrams:130 },
  { id:20, name:"Beef (lean)",        cal100:215, pro100:26,  carb100:0,    fat100:12,  unit:"g" },
  { id:21, name:"Cheddar Cheese",     cal100:402, pro100:25,  carb100:1.3,  fat100:33,  unit:"g", defaultGrams:28 },
  { id:22, name:"Spinach",            cal100:23,  pro100:2.9, carb100:3.6,  fat100:0.4, unit:"g" },
  { id:23, name:"Olive Oil",          cal100:884, pro100:0,   carb100:0,    fat100:100, unit:"ml",defaultGrams:14 },
  { id:24, name:"Pasta (cooked)",     cal100:158, pro100:5.8, carb100:31,   fat100:0.9, unit:"g" },
  { id:25, name:"Turkey Breast",      cal100:135, pro100:30,  carb100:0,    fat100:1,   unit:"g" },
];

const MEALS = ["Breakfast","Lunch","Dinner","Snacks"];
const HABITS = ["Logged all meals","Hit protein goal","Hit calorie goal","Drank 8 glasses","Exercised","8hrs sleep"];
const MEASUREMENT_FIELDS = ["Weight","Waist","Chest","Hips","Thighs","Biceps","Neck","Body Fat %"];
const TODAY = new Date().toISOString().split("T")[0];
const todayStr = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
const scaleFood = (food,grams) => { const r=grams/100; return {...food,grams,calories:Math.round(food.cal100*r),protein:Math.round(food.pro100*r*10)/10,carbs:Math.round(food.carb100*r*10)/10,fat:Math.round(food.fat100*r*10)/10}; };
const ts = () => new Date().toISOString();
const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); } catch(e){return "";} };
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString([],{month:"short",day:"numeric"}); } catch(e){return "";} };

const DEMO_ACCOUNTS = {
  "coach@demo.com":   { password:"coach123",  role:"coach",  name:"RBPT Coach", id:"coach1" },
  "sarah@demo.com":   { password:"client123", role:"client", name:"Sarah K.",    id:"client_sarah",   goals:{calories:1800,protein:140,carbs:180,fat:60}  },
  "mike@demo.com":    { password:"client123", role:"client", name:"Mike T.",     id:"client_mike",    goals:{calories:2400,protein:190,carbs:240,fat:80}  },
  "jessica@demo.com": { password:"client123", role:"client", name:"Jessica R.",  id:"client_jessica", goals:{calories:1600,protein:120,carbs:160,fat:55}  },
};
const CLIENT_LIST = Object.entries(DEMO_ACCOUNTS).filter(([,v])=>v.role==="client").map(([email,v])=>({...v,email}));

// Style tokens
const T = {
  bg:"#0a0a0f", bg2:"#0f0f1a", card:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)",
  muted:"#6b7280", dim:"#4b5563", text:"#e5e7eb",
  green:"#38bdf8", blue:"#6366f1", amber:"#f59e0b", red:"#ef4444", purple:"#a78bfa", orange:"#fb923c", pink:"#ec4899",
};
const cs  = { background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:16, marginBottom:12 };
const inp = { background:"rgba(255,255,255,0.06)", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", width:"100%", outline:"none", boxSizing:"border-box" };
const btn = (bg=T.green,c="#000") => ({ background:bg, border:"none", borderRadius:10, padding:"10px 18px", color:c, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" });

// ─── Storage helpers ──────────────────────────────────────────────────────────
const store = {
  get: async (key) => { try { const r=await window.storage.get(key,true); return r?JSON.parse(r.value):null; } catch(e){return null;} },
  set: async (key,val) => { try { await window.storage.set(key,JSON.stringify(val),true); } catch(e){} },
};

// ─── GramPicker ───────────────────────────────────────────────────────────────
function GramPicker({food,onConfirm,onClose}) {
  const [g,setG]=useState(food.defaultGrams||100);
  const s=scaleFood(food,g);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.bg2,borderRadius:"20px 20px 0 0",padding:20,width:"100%",maxWidth:420,border:`1px solid ${T.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontWeight:700,fontSize:16}}>{food.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:11,color:T.muted,marginBottom:14}}>Adjust serving size</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <input type="number" min={1} max={2000} value={g} onChange={e=>setG(Math.max(1,Number(e.target.value)))}
            style={{width:76,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 10px",color:T.text,fontSize:18,fontFamily:"'DM Mono',monospace",outline:"none",textAlign:"center"}}/>
          <div style={{fontSize:13,color:T.muted}}>{food.unit}</div>
          <input type="range" min={1} max={500} value={Math.min(g,500)} onChange={e=>setG(Number(e.target.value))} style={{flex:1,accentColor:T.green}}/>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
          {[25,50,100,150,200].map(x=>(<button key={x} onClick={()=>setG(x)} style={{background:g===x?T.green:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"5px 11px",color:g===x?"#000":T.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{x}{food.unit}</button>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:16}}>
          {[{l:"Cal",v:s.calories,c:T.green},{l:"Protein",v:s.protein+"g",c:T.blue},{l:"Carbs",v:s.carbs+"g",c:T.amber},{l:"Fat",v:s.fat+"g",c:T.red}].map(m=>(
            <div key={m.l} style={{background:`${m.c}12`,border:`1px solid ${m.c}22`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:700,color:m.c,fontFamily:"'DM Mono',monospace"}}>{m.v}</div>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{m.l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>onConfirm(s)} style={{...btn(),width:"100%",padding:13,fontSize:14}}>Add {g}{food.unit} of {food.name}</button>
      </div>
    </div>
  );
}

// ─── Messaging ────────────────────────────────────────────────────────────────
function MessagingPanel({myId,myName,otherIds,isCoach,onClose}) {
  const [activeThread,setActiveThread]=useState(isCoach?null:otherIds[0]);
  const [messages,setMessages]=useState([]);
  const [draft,setDraft]=useState("");
  const [sending,setSending]=useState(false);
  const [unread,setUnread]=useState({});
  const bottomRef=useRef(null);

  const threadKey = (a,b) => `chat:${[a,b].sort().join(":")}`;

  const loadMessages = useCallback(async(otherId)=>{
    const data = await store.get(threadKey(myId,otherId));
    setMessages(data||[]);
    // Mark as read
    const readKey=`chat_read:${myId}:${otherId}`;
    await store.set(readKey,{ts:ts()});
  },[myId]);

  const loadUnread = useCallback(async()=>{
    const u={};
    for(const oid of otherIds){
      const msgs = await store.get(threadKey(myId,oid));
      const readData = await store.get(`chat_read:${myId}:${oid}`);
      const readTs = readData?.ts||"";
      const unreadCount = (msgs||[]).filter(m=>m.senderId!==myId && m.ts>readTs).length;
      if(unreadCount>0) u[oid]=unreadCount;
    }
    setUnread(u);
  },[myId,otherIds]);

  useEffect(()=>{ loadUnread(); },[]);
  useEffect(()=>{ if(activeThread){ loadMessages(activeThread); const iv=setInterval(()=>loadMessages(activeThread),4000); return()=>clearInterval(iv); } },[activeThread]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const send = async() => {
    if(!draft.trim()||!activeThread) return;
    setSending(true);
    const msg={id:Date.now(),senderId:myId,senderName:myName,text:draft.trim(),ts:ts()};
    const key=threadKey(myId,activeThread);
    const existing=await store.get(key)||[];
    await store.set(key,[...existing,msg]);
    setMessages(prev=>[...prev,msg]);
    setDraft("");
    setSending(false);
  };

  const getOtherName = (id) => {
    const acct=Object.values(DEMO_ACCOUNTS).find(a=>a.id===id);
    return acct?.name||id;
  };

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto"}}>
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          {isCoach&&activeThread&&<button onClick={()=>setActiveThread(null)} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",padding:"0 0 4px",display:"block"}}>← All chats</button>}
          <div style={{fontSize:20,fontWeight:700}}>{activeThread?`Chat with ${getOtherName(activeThread)}`:"Messages"}</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>

      {/* Coach: show thread list first */}
      {isCoach&&!activeThread&&(
        <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px"}}>
          {otherIds.map(oid=>(
            <button key={oid} onClick={()=>{setActiveThread(oid);loadMessages(oid);}}
              style={{width:"100%",...cs,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${T.green}33,${T.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:T.green,flexShrink:0}}>
                {getOtherName(oid)[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{getOtherName(oid)}</div>
                <div style={{fontSize:11,color:T.muted}}>Tap to open chat</div>
              </div>
              {unread[oid]&&<div style={{background:T.green,color:"#000",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{unread[oid]}</div>}
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      {activeThread&&(
        <>
          <div style={{flex:1,overflowY:"auto",padding:"0 16px 8px"}}>
            {messages.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:T.dim,fontSize:13}}>No messages yet. Say hello! 👋</div>}
            {messages.map((m,i)=>{
              const mine=m.senderId===myId;
              const showDate=i===0||fmtDate(messages[i-1].ts)!==fmtDate(m.ts);
              return (
                <div key={m.id}>
                  {showDate&&<div style={{textAlign:"center",fontSize:11,color:T.dim,margin:"12px 0 6px"}}>{fmtDate(m.ts)}</div>}
                  <div style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",marginBottom:6}}>
                    <div style={{maxWidth:"78%"}}>
                      {!mine&&<div style={{fontSize:10,color:T.muted,marginBottom:3,marginLeft:4}}>{m.senderName}</div>}
                      <div style={{background:mine?T.green:"rgba(255,255,255,0.08)",color:mine?"#000":T.text,borderRadius:mine?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.4}}>
                        {m.text}
                      </div>
                      <div style={{fontSize:9,color:T.dim,marginTop:3,textAlign:mine?"right":"left",marginLeft:mine?0:4}}>{fmtTime(m.ts)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:"12px 16px 24px",borderTop:`1px solid ${T.border}`,background:T.bg2}}>
            <div style={{display:"flex",gap:8}}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder="Type a message…" style={{...inp,flex:1,padding:"10px 14px"}}/>
              <button onClick={send} disabled={!draft.trim()||sending}
                style={{...btn(draft.trim()?T.green:"rgba(255,255,255,0.06)",draft.trim()?"#000":T.dim),padding:"10px 16px",flexShrink:0}}>
                {sending?"…":"Send"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── WeeklyCheckIn ────────────────────────────────────────────────────────────
function WeeklyCheckIn({userId,onClose}) {
  const WEEK = new Date().toISOString().slice(0,10).slice(0,7)+"-W"+Math.ceil(new Date().getDate()/7);
  const [form,setForm]=useState({mood:3,energy:3,sleep:3,stress:3,adherence:3,wins:"",struggles:"",questions:""});
  const [submitted,setSubmitted]=useState(false);
  const [loading,setLoading]=useState(true);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    store.get(`checkin:${userId}:${WEEK}`).then(d=>{ if(d){setForm(d);setSubmitted(true);} setLoading(false); });
  },[]);

  const submit=async()=>{
    const data={...form,submittedAt:ts(),week:WEEK};
    await store.set(`checkin:${userId}:${WEEK}`,data);
    setSubmitted(true);
  };

  const RatingRow=({label,k,emoji,color=T.green})=>(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:500}}>{emoji} {label}</div>
        <div style={{fontSize:13,fontWeight:700,color,fontFamily:"'DM Mono',monospace"}}>{form[k]}/5</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[1,2,3,4,5].map(n=>(
          <button key={n} onClick={()=>!submitted&&set(k,n)}
            style={{flex:1,height:36,borderRadius:8,border:"none",cursor:submitted?"default":"pointer",
              background:form[k]>=n?color:"rgba(255,255,255,0.06)",
              transition:"background 0.15s",opacity:submitted?0.8:1}}/>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <div style={{fontSize:9,color:T.dim}}>Poor</div>
        <div style={{fontSize:9,color:T.dim}}>Excellent</div>
      </div>
    </div>
  );

  if(loading) return null;

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:12,color:T.muted,marginBottom:2}}>Weekly</div><div style={{fontSize:20,fontWeight:700}}>Check-In 📋</div></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 32px"}}>
        {submitted&&<div style={{...cs,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",textAlign:"center",marginBottom:16}}><div style={{fontSize:20,marginBottom:4}}>✅</div><div style={{fontSize:13,color:T.green,fontWeight:600}}>Check-in submitted! Your coach will review this.</div></div>}
        <div style={cs}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>How was this week?</div>
          <RatingRow label="Overall Mood"   k="mood"       emoji="😊" color={T.purple}/>
          <RatingRow label="Energy Levels"  k="energy"     emoji="⚡" color={T.amber}/>
          <RatingRow label="Sleep Quality"  k="sleep"      emoji="😴" color={T.blue}/>
          <RatingRow label="Stress Level"   k="stress"     emoji="😤" color={T.red}/>
          <RatingRow label="Diet Adherence" k="adherence"  emoji="🥗" color={T.green}/>
        </div>
        <div style={cs}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Open Questions</div>
          {[{l:"🏆 Wins this week",k:"wins",ph:"What went well?"},{l:"😓 Struggles",k:"struggles",ph:"What was challenging?"},{l:"❓ Questions for coach",k:"questions",ph:"Anything you want to ask?"}].map(f=>(
            <div key={f.k} style={{marginBottom:12}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:5}}>{f.l}</div>
              <textarea value={form[f.k]} onChange={e=>!submitted&&set(f.k,e.target.value)} placeholder={f.ph}
                style={{...inp,minHeight:72,resize:"vertical"}} disabled={submitted}/>
            </div>
          ))}
        </div>
        {!submitted&&<button onClick={submit} style={{...btn(),width:"100%",padding:14,fontSize:15}}>Submit Check-In ✓</button>}
      </div>
    </div>
  );
}

// ─── ProgressPhotos ───────────────────────────────────────────────────────────
function ProgressPhotos({userId,isCoach,clientName,onClose}) {
  const [photos,setPhotos]=useState([]);
  const [preview,setPreview]=useState(null);
  const [uploading,setUploading]=useState(false);
  const fileRef=useRef();

  const loadPhotos=useCallback(async()=>{
    const data=await store.get(`photos:${userId}`);
    setPhotos(data||[]);
  },[userId]);

  useEffect(()=>{ loadPhotos(); },[]);

  const handleFile=async(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    setUploading(true);
    const reader=new FileReader();
    reader.onload=async(ev)=>{
      const base64=ev.target.result;
      const entry={id:Date.now(),url:base64,date:TODAY,dateStr:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),note:""};
      const existing=await store.get(`photos:${userId}`)||[];
      const updated=[entry,...existing].slice(0,20); // keep last 20
      await store.set(`photos:${userId}`,updated);
      setPhotos(updated);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          {isCoach&&<div style={{fontSize:12,color:T.muted,marginBottom:2}}>{clientName}</div>}
          <div style={{fontSize:20,fontWeight:700}}>Progress Photos 📸</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 32px"}}>
        {!isCoach&&(
          <div style={{marginBottom:16}}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current.click()} disabled={uploading}
              style={{...btn(T.green,"#000"),width:"100%",padding:13,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {uploading?"Uploading…":"📷 Upload New Photo"}
            </button>
            <div style={{fontSize:11,color:T.muted,textAlign:"center",marginTop:6}}>Photos are shared with your coach</div>
          </div>
        )}
        {photos.length===0&&(
          <div style={{textAlign:"center",padding:"50px 0",color:T.dim}}>
            <div style={{fontSize:44,marginBottom:12}}>📷</div>
            <div style={{fontSize:15,color:T.muted,fontWeight:600,marginBottom:4}}>No photos yet</div>
            <div style={{fontSize:13}}>{isCoach?"Client hasn't uploaded any photos yet":"Tap the button above to upload your first progress photo"}</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {photos.map(p=>(
            <button key={p.id} onClick={()=>setPreview(p)}
              style={{background:"none",border:"none",cursor:"pointer",borderRadius:12,overflow:"hidden",aspectRatio:"3/4",position:"relative"}}>
              <img src={p.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.7))",padding:"12px 8px 8px"}}>
                <div style={{fontSize:11,color:"#fff",fontWeight:500}}>{p.dateStr}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Full-screen preview */}
      {preview&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <button onClick={()=>setPreview(null)} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:10,width:36,height:36,color:T.text,fontSize:20,cursor:"pointer"}}>×</button>
          <img src={preview.url} alt="" style={{maxWidth:"100%",maxHeight:"80vh",objectFit:"contain",borderRadius:12}}/>
          <div style={{fontSize:13,color:T.muted,marginTop:12}}>{preview.dateStr}</div>
        </div>
      )}
    </div>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");

  const tryLogin=(e,p)=>{
    const key=(e||"").toLowerCase().trim();
    const pw=(p||"").trim();
    const acct=DEMO_ACCOUNTS[key];
    if(!acct||acct.password!==pw){setError("Invalid email or password.");return;}
    setError("");
    onLogin(acct,key);
  };

  const DEMO=[
    {label:"🏋️ RBPT Coach", email:"coach@demo.com",  pass:"coach123",  role:"Coach",  color:T.green},
    {label:"👤 Sarah K.",    email:"sarah@demo.com",   pass:"client123", role:"Client", color:T.blue},
    {label:"👤 Mike T.",     email:"mike@demo.com",    pass:"client123", role:"Client", color:T.blue},
    {label:"👤 Jessica R.",  email:"jessica@demo.com", pass:"client123", role:"Client", color:T.blue},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {/* RBPT Logo mark */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:10}}>
            <div style={{fontSize:36,fontWeight:900,letterSpacing:"-0.04em",color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>RBPT</div>
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <polygon points="16,0 4,20 14,20 10,36 26,14 16,14 22,0" fill="#38bdf8"/>
              <polygon points="16,0 14,6 20,14 16,14 22,0" fill="#fff" opacity="0.5"/>
            </svg>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:"#38bdf8",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:2}}>Performance Coaching</div>
          <div style={{fontSize:11,color:T.muted,marginTop:6}}>Nutrition Tracking Platform</div>
        </div>

        {/* One-tap demo login — primary way in */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,textAlign:"center"}}>Tap to sign in instantly</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {DEMO.map(a=>(
              <button key={a.email} onClick={()=>tryLogin(a.email,a.pass)}
                style={{display:"flex",alignItems:"center",gap:12,background:T.bg2,border:`1px solid ${a.color}33`,borderRadius:14,padding:"12px 16px",cursor:"pointer",textAlign:"left",transition:"border-color 0.2s"}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:`${a.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{a.label.split(" ")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>{a.label.slice(3)}</div>
                  <div style={{fontSize:11,color:T.muted}}>{a.role} · {a.email}</div>
                </div>
                <div style={{fontSize:13,color:a.color,fontWeight:600}}>→</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual login — collapsible */}
        <details style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:14,padding:14}}>
          <summary style={{fontSize:12,color:T.muted,cursor:"pointer",listStyle:"none",textAlign:"center"}}>Sign in manually ▾</summary>
          <div style={{marginTop:14}}>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Email</div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={inp} onKeyDown={e=>e.key==="Enter"&&tryLogin(email,password)}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Password</div>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e=>e.key==="Enter"&&tryLogin(email,password)}/>
            </div>
            {error&&<div style={{fontSize:13,color:T.red,marginBottom:10,textAlign:"center"}}>{error}</div>}
            <button onClick={()=>tryLogin(email,password)} style={{...btn(),width:"100%",padding:12,fontSize:14}}>Sign In</button>
          </div>
        </details>
      </div>
    </div>
  );
}

// ─── CoachDashboard ───────────────────────────────────────────────────────────
function CoachDashboard({coach,onLogout,setCoachMode}) {
  const [clientsData,setClientsData]=useState({});
  const [selectedClient,setSelectedClient]=useState(null);
  const [loading,setLoading]=useState(true);
  const [lastRefresh,setLastRefresh]=useState(null);
  const [showMsg,setShowMsg]=useState(false);
  const [showPhotos,setShowPhotos]=useState(false);
  const [showCheckin,setShowCheckin]=useState(null);
  const [editingGoals,setEditingGoals]=useState(false);
  const [draftGoals,setDraftGoals]=useState({});
  const [savingGoals,setSavingGoals]=useState(false);
  const [coachTab,setCoachTab]=useState("clients"); // clients | checkins
  const [unreadMsgs,setUnreadMsgs]=useState(0);

  const loadAll=useCallback(async()=>{
    setLoading(true);
    const data={};
    for(const client of CLIENT_LIST){
      const diary=await store.get(`client_diary:${client.id}:${TODAY}`);
      const goals=await store.get(`client_goals:${client.id}`)||client.goals;
      const checkin=await store.get(`checkin:${client.id}:${new Date().toISOString().slice(0,7)}-W${Math.ceil(new Date().getDate()/7)}`);
      data[client.id]={...(diary||{diary:{Breakfast:[],Lunch:[],Dinner:[],Snacks:[]},habits:{},water:0}),goals,checkin};
    }
    // Count unread messages
    let unread=0;
    for(const client of CLIENT_LIST){
      const msgs=await store.get(`chat:${["coach1",client.id].sort().join(":")}`)||[];
      const readData=await store.get(`chat_read:coach1:${client.id}`);
      const readTs=readData?.ts||"";
      unread+=msgs.filter(m=>m.senderId!==coach.id&&m.ts>readTs).length;
    }
    setUnreadMsgs(unread);
    setClientsData(data);
    setLastRefresh(new Date().toLocaleTimeString());
    setLoading(false);
  },[]);

  useEffect(()=>{ loadAll(); const iv=setInterval(loadAll,20000); return()=>clearInterval(iv); },[]);

  const getTotals=(diary)=>Object.values(diary||{}).flat().reduce((a,i)=>({calories:a.calories+(i.calories||0),protein:a.protein+(i.protein||0),carbs:a.carbs+(i.carbs||0),fat:a.fat+(i.fat||0)}),{calories:0,protein:0,carbs:0,fat:0});
  const pct=(v,g)=>Math.min(100,Math.round((v/(g||1))*100));

  const saveGoals=async(clientId)=>{
    setSavingGoals(true);
    await store.set(`client_goals:${clientId}`,draftGoals);
    setSavingGoals(false);
    setEditingGoals(false);
    loadAll();
  };

  const selected=selectedClient?CLIENT_LIST.find(c=>c.id===selectedClient):null;
  const selData=selected?clientsData[selected.id]:null;

  const MacroBadge=({v,g,c,l})=>(
    <div style={{flex:1,textAlign:"center"}}>
      <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:"'DM Mono',monospace"}}>{v}g</div>
      <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,margin:"3px 0",overflow:"hidden"}}><div style={{width:`${pct(v,g)}%`,height:"100%",background:c}}/></div>
      <div style={{fontSize:9,color:T.muted}}>{l}</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",maxWidth:420,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{padding:"20px 20px 0",background:`linear-gradient(180deg,${T.bg2} 0%,transparent 100%)`,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:12,color:"#38bdf8",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>RBPT Performance Coaching</div>
            <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em"}}>{coach.name} ⚡</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{todayStr}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <button onClick={onLogout} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",color:T.muted,fontSize:11,cursor:"pointer"}}>Sign Out</button>
            <button onClick={loadAll} style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:8,padding:"4px 10px",color:T.green,fontSize:11,cursor:"pointer"}}>↻ Refresh</button>
          </div>
        </div>
        {lastRefresh&&<div style={{fontSize:10,color:T.dim,marginTop:4}}>Synced {lastRefresh} · auto every 20s</div>}
        {/* Mode switcher */}
        <div style={{display:"flex",gap:0,marginTop:12,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:2}}>
          <button onClick={()=>setCoachMode("coaching")} style={{flex:1,background:T.green,border:"none",borderRadius:8,padding:"7px 0",color:"#000",fontWeight:700,fontSize:12,cursor:"pointer"}}>🏋️ Coach View</button>
          <button onClick={()=>setCoachMode("personal")} style={{flex:1,background:"transparent",border:"none",borderRadius:8,padding:"7px 0",color:T.muted,fontWeight:600,fontSize:12,cursor:"pointer"}}>👤 My Tracking</button>
        </div>
        {/* Coach tabs */}
        <div style={{display:"flex",gap:0,marginTop:8,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3}}>
          {[{id:"clients",l:"👥 Clients"},{id:"checkins",l:"📋 Check-ins"}].map(t=>(
            <button key={t.id} onClick={()=>setCoachTab(t.id)} style={{flex:1,background:coachTab===t.id?"rgba(255,255,255,0.1)":"transparent",border:"none",borderRadius:8,padding:"7px 0",color:coachTab===t.id?T.text:T.muted,fontWeight:600,fontSize:12,cursor:"pointer",transition:"all 0.2s"}}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 16px 32px"}}>
        {loading&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{width:32,height:32,border:`3px solid rgba(34,197,94,0.2)`,borderTop:`3px solid ${T.green}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/><div style={{fontSize:13,color:T.muted}}>Loading…</div></div>}

        {/* ── CLIENTS TAB ── */}
        {!loading&&coachTab==="clients"&&!selectedClient&&(
          <>
            {/* Message button */}
            <button onClick={()=>setShowMsg(true)} style={{width:"100%",...cs,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.2)"}}>
              <div style={{fontSize:24}}>💬</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14,color:T.purple}}>Messages</div><div style={{fontSize:11,color:T.muted}}>Chat with your clients</div></div>
              {unreadMsgs>0&&<div style={{background:T.red,color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:12,fontWeight:700}}>{unreadMsgs}</div>}
            </button>

            <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Your Clients — Today</div>
            {CLIENT_LIST.map(client=>{
              const data=clientsData[client.id];
              const totals=getTotals(data?.diary);
              const goals=data?.goals||client.goals;
              const calPct=pct(totals.calories,goals.calories);
              const hasLogged=Object.values(data?.diary||{}).flat().length>0;
              const habitsDone=Object.values(data?.habits||{}).filter(Boolean).length;
              const hasCheckin=!!data?.checkin;
              return (
                <button key={client.id} onClick={()=>setSelectedClient(client.id)}
                  style={{width:"100%",...cs,cursor:"pointer",textAlign:"left",border:`1px solid ${hasLogged?"rgba(34,197,94,0.2)":T.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${T.green}33,${T.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:T.green,flexShrink:0}}>{client.name[0]}</div>
                      <div><div style={{fontWeight:700,fontSize:14}}>{client.name}</div><div style={{fontSize:11,color:T.muted}}>{client.email}</div></div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:16,fontWeight:700,color:calPct>80?T.green:calPct>50?T.amber:T.muted,fontFamily:"'DM Mono',monospace"}}>{totals.calories}</div>
                      <div style={{fontSize:10,color:T.muted}}>/ {goals.calories} kcal</div>
                    </div>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden",marginBottom:9}}><div style={{width:`${calPct}%`,height:"100%",background:calPct>100?T.red:T.green,borderRadius:3}}/></div>
                  <div style={{display:"flex",gap:8,marginBottom:9}}>
                    <MacroBadge v={totals.protein} g={goals.protein} c={T.blue} l="Protein"/>
                    <MacroBadge v={totals.carbs}   g={goals.carbs}   c={T.amber} l="Carbs"/>
                    <MacroBadge v={totals.fat}     g={goals.fat}     c={T.red}   l="Fat"/>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:10,background:hasLogged?"rgba(34,197,94,0.12)":"rgba(255,255,255,0.05)",color:hasLogged?T.green:T.dim,borderRadius:6,padding:"2px 7px"}}>{hasLogged?"✓ Logged":"No logs"}</span>
                    {habitsDone>0&&<span style={{fontSize:10,background:"rgba(251,146,60,0.12)",color:T.orange,borderRadius:6,padding:"2px 7px"}}>🔥 {habitsDone}/{HABITS.length}</span>}
                    {hasCheckin&&<span style={{fontSize:10,background:"rgba(139,92,246,0.12)",color:T.purple,borderRadius:6,padding:"2px 7px"}}>📋 Check-in done</span>}
                    {data?.water>0&&<span style={{fontSize:10,color:T.blue}}>💧{data.water}/8</span>}
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* ── CHECK-INS TAB ── */}
        {!loading&&coachTab==="checkins"&&(
          <>
            <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>This Week's Check-ins</div>
            {CLIENT_LIST.map(client=>{
              const checkin=clientsData[client.id]?.checkin;
              return (
                <div key={client.id} style={cs}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:checkin?12:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.green}33,${T.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:T.green}}>{client.name[0]}</div>
                      <div style={{fontWeight:600,fontSize:14}}>{client.name}</div>
                    </div>
                    {checkin?<span style={{fontSize:11,background:"rgba(34,197,94,0.12)",color:T.green,borderRadius:6,padding:"3px 8px"}}>✓ Submitted</span>:<span style={{fontSize:11,color:T.dim}}>Not submitted</span>}
                  </div>
                  {checkin&&(
                    <div>
                      <div style={{display:"flex",gap:8,marginBottom:10}}>
                        {[{l:"Mood",k:"mood",c:T.purple},{l:"Energy",k:"energy",c:T.amber},{l:"Sleep",k:"sleep",c:T.blue},{l:"Adherence",k:"adherence",c:T.green}].map(m=>(
                          <div key={m.k} style={{flex:1,textAlign:"center",background:`${m.c}10`,borderRadius:8,padding:"7px 4px"}}>
                            <div style={{fontSize:16,fontWeight:700,color:m.c}}>{checkin[m.k]}/5</div>
                            <div style={{fontSize:9,color:T.muted}}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                      {checkin.wins&&<div style={{fontSize:12,marginBottom:6}}><span style={{color:T.green}}>🏆 </span><span style={{color:T.muted}}>{checkin.wins}</span></div>}
                      {checkin.struggles&&<div style={{fontSize:12,marginBottom:6}}><span style={{color:T.amber}}>😓 </span><span style={{color:T.muted}}>{checkin.struggles}</span></div>}
                      {checkin.questions&&<div style={{fontSize:12,padding:"8px 10px",background:"rgba(139,92,246,0.08)",borderRadius:8,color:"#c4b5fd"}}>❓ {checkin.questions}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── CLIENT DETAIL ── */}
        {!loading&&selectedClient&&selected&&selData&&(
          <>
            <button onClick={()=>{setSelectedClient(null);setEditingGoals(false);}} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",padding:"0 0 12px",display:"flex",alignItems:"center",gap:4}}>← Back</button>

            {/* Client header */}
            <div style={{...cs,background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${T.green}44,${T.blue}44)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:T.green}}>{selected.name[0]}</div>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:16}}>{selected.name}</div><div style={{fontSize:11,color:T.muted}}>{selected.email}</div></div>
              </div>
              {/* Quick actions */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:"💬 Message",bg:"rgba(139,92,246,0.15)",c:T.purple,fn:()=>setShowMsg(true)},{l:"📸 Photos",bg:"rgba(236,72,153,0.12)",c:T.pink,fn:()=>setShowPhotos(true)},{l:"📋 Check-in",bg:"rgba(59,130,246,0.12)",c:T.blue,fn:()=>setShowCheckin(selected.id)}].map(a=>(
                  <button key={a.l} onClick={a.fn} style={{background:a.bg,border:`1px solid ${a.c}33`,borderRadius:10,padding:"9px 6px",color:a.c,fontSize:11,fontWeight:600,cursor:"pointer"}}>{a.l}</button>
                ))}
              </div>
            </div>

            {/* Remote goal editor */}
            <div style={cs}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>🎯 Client Goals</div>
                {!editingGoals
                  ?<button onClick={()=>{setEditingGoals(true);setDraftGoals(selData.goals||selected.goals);}} style={{background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:8,padding:"4px 10px",color:T.green,fontSize:12,fontWeight:600,cursor:"pointer"}}>Edit Goals</button>
                  :<div style={{display:"flex",gap:6}}><button onClick={()=>saveGoals(selected.id)} style={{...btn(),padding:"4px 10px",fontSize:12}}>{savingGoals?"Saving…":"Save"}</button><button onClick={()=>setEditingGoals(false)} style={{...btn("rgba(255,255,255,0.07)",T.muted),padding:"4px 10px",fontSize:12}}>Cancel</button></div>
                }
              </div>
              {editingGoals?(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[{l:"Calories",k:"calories",unit:"kcal",c:T.green,min:1000,max:4000},{l:"Protein",k:"protein",unit:"g",c:T.blue,min:50,max:400},{l:"Carbs",k:"carbs",unit:"g",c:T.amber,min:50,max:500},{l:"Fat",k:"fat",unit:"g",c:T.red,min:20,max:200}].map(f=>(
                    <div key={f.k}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><label style={{fontSize:13,color:f.c}}>{f.l}</label><span style={{fontSize:12,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{draftGoals[f.k]} {f.unit}</span></div>
                      <input type="range" min={f.min} max={f.max} value={draftGoals[f.k]||0} onChange={e=>setDraftGoals(p=>({...p,[f.k]:Number(e.target.value)}))} style={{width:"100%",accentColor:f.c}}/>
                    </div>
                  ))}
                  <div style={{fontSize:11,color:T.amber,background:"rgba(245,158,11,0.08)",borderRadius:8,padding:"8px 10px"}}>⚡ Saving will update this client's goals in real-time</div>
                </div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{l:"Calories",v:selData.goals?.calories||selected.goals.calories,c:T.green,u:"kcal"},{l:"Protein",v:selData.goals?.protein||selected.goals.protein,c:T.blue,u:"g"},{l:"Carbs",v:selData.goals?.carbs||selected.goals.carbs,c:T.amber,u:"g"},{l:"Fat",v:selData.goals?.fat||selected.goals.fat,c:T.red,u:"g"}].map(g=>(
                    <div key={g.l} style={{textAlign:"center",background:`${g.c}10`,borderRadius:10,padding:"10px 8px"}}>
                      <div style={{fontSize:18,fontWeight:700,color:g.c,fontFamily:"'DM Mono',monospace"}}>{g.v}</div>
                      <div style={{fontSize:10,color:T.muted}}>{g.l} ({g.u})</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Food diary */}
            <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Today's Diary</div>
            {MEALS.map(meal=>{
              const foods=selData.diary?.[meal]||[];
              const mc=foods.reduce((a,f)=>a+(f.calories||0),0);
              return (
                <div key={meal} style={cs}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontWeight:600,fontSize:14}}>{meal}</div>
                    <div style={{fontSize:11,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{mc} kcal</div>
                  </div>
                  {foods.length===0?<div style={{fontSize:12,color:T.dim}}>Nothing logged</div>:foods.map((f,i)=>(
                    <div key={i} style={{padding:"6px 0",borderTop:`1px solid rgba(255,255,255,0.05)`,display:"flex",justifyContent:"space-between"}}>
                      <div><div style={{fontSize:13,fontWeight:500}}>{f.name}</div><div style={{fontSize:11,color:T.muted}}>{f.grams!=null?`${f.grams}${f.unit} · `:""}<span style={{color:T.blue}}>P:{f.protein}g</span> · <span style={{color:T.amber}}>C:{f.carbs}g</span> · <span style={{color:T.red}}>F:{f.fat}g</span></div></div>
                      <div style={{fontSize:13,fontWeight:600,color:T.green,fontFamily:"'DM Mono',monospace"}}>{f.calories}</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Habits */}
            {Object.keys(selData.habits||{}).length>0&&(
              <div style={cs}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Habits</div>
                {HABITS.map(h=>(
                  <div key={h} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}>
                    <div style={{width:18,height:18,borderRadius:5,background:selData.habits[h]?"rgba(34,197,94,0.2)":"rgba(255,255,255,0.04)",border:`1.5px solid ${selData.habits[h]?T.green:T.dim}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {selData.habits[h]&&<div style={{color:T.green,fontSize:11,fontWeight:700}}>✓</div>}
                    </div>
                    <div style={{fontSize:13,color:selData.habits[h]?T.text:T.muted,textDecoration:selData.habits[h]?"line-through":"none"}}>{h}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showMsg&&<MessagingPanel myId={coach.id} myName={coach.name} otherIds={CLIENT_LIST.map(c=>c.id)} isCoach={true} onClose={()=>{setShowMsg(false);loadAll();}}/>}
      {showPhotos&&selected&&<ProgressPhotos userId={selected.id} isCoach={true} clientName={selected.name} onClose={()=>setShowPhotos(false)}/>}
      {showCheckin&&<div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:T.muted,fontSize:14}}>
        <div style={{marginBottom:12}}>This view is for client check-ins. Ask {selected?.name} to submit via their app.</div>
        <button onClick={()=>setShowCheckin(null)} style={btn()}>Close</button>
      </div>}
    </div>
  );
}


// ─── ProgressGraph ────────────────────────────────────────────────────────────
function ProgressGraph({userId,onClose}) {
  const [log,setLog]=useState([]);
  const [metric,setMetric]=useState("Weight");
  const [newVal,setNewVal]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ store.get(`progress_log:${userId}`).then(d=>setLog(d||[])); },[userId]);

  const save=async()=>{
    if(!newVal) return;
    setSaving(true);
    const entry={date:TODAY,dateStr:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),metric,value:parseFloat(newVal)};
    const updated=[...log.filter(e=>!(e.date===TODAY&&e.metric===metric)),entry].sort((a,b)=>a.date.localeCompare(b.date));
    await store.set(`progress_log:${userId}`,updated);
    setLog(updated);
    setNewVal("");
    setSaving(false);
  };

  const metrics=["Weight","Body Fat %","Waist","Chest","Hips","Biceps"];
  const filtered=log.filter(e=>e.metric===metric).slice(-12);
  const vals=filtered.map(e=>e.value);
  const minV=vals.length?Math.min(...vals)*0.97:0;
  const maxV=vals.length?Math.max(...vals)*1.03:100;
  const range=maxV-minV||1;
  const W=320,H=140,PAD=10;
  const toX=(i)=>PAD+(i/(Math.max(filtered.length-1,1)))*(W-PAD*2);
  const toY=(v)=>H-PAD-((v-minV)/range)*(H-PAD*2);
  const pts=filtered.map((e,i)=>({x:toX(i),y:toY(e.value),e}));
  const pathD=pts.length>1?pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" "):"";
  const areaD=pts.length>1?`${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`:"";
  const latest=filtered[filtered.length-1];
  const prev=filtered[filtered.length-2];
  const diff=latest&&prev?((latest.value-prev.value)>=0?"+":"")+((latest.value-prev.value).toFixed(1)):"";
  const diffColor=metric==="Weight"||metric==="Body Fat %"||metric==="Waist"?(latest&&prev&&latest.value<prev.value?T.green:T.red):(latest&&prev&&latest.value>prev.value?T.green:T.red);

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto"}}>
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:12,color:T.muted,marginBottom:2}}>Tracking</div><div style={{fontSize:20,fontWeight:700}}>Progress Graph 📈</div></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 32px"}}>
        {/* Metric selector */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {metrics.map(m=>(
            <button key={m} onClick={()=>setMetric(m)} style={{background:metric===m?T.green:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"6px 12px",color:metric===m?"#000":T.muted,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{m}</button>
          ))}
        </div>

        {/* Chart card */}
        <div style={{...cs,padding:"16px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>{metric}</div>
              {latest&&<div style={{fontSize:28,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace",marginTop:2}}>{latest.value}<span style={{fontSize:13,color:T.muted,fontWeight:400}}>{metric==="Body Fat %"?"%":" lbs"}</span></div>}
              {diff&&<div style={{fontSize:13,fontWeight:600,color:diffColor}}>{diff} from last entry</div>}
            </div>
            {filtered.length===0&&<div style={{fontSize:12,color:T.dim,padding:"20px 0",textAlign:"center",width:"100%"}}>No data yet — log your first entry below</div>}
          </div>
          {filtered.length>1&&(
            <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,overflow:"visible"}}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity="0.3"/>
                  <stop offset="100%" stopColor={T.green} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0,0.25,0.5,0.75,1].map(p=>(
                <line key={p} x1={PAD} y1={PAD+(p*(H-PAD*2))} x2={W-PAD} y2={PAD+(p*(H-PAD*2))} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              ))}
              {/* Area fill */}
              <path d={areaD} fill="url(#grad)"/>
              {/* Line */}
              <path d={pathD} fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Dots */}
              {pts.map((p,i)=>(
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={T.green} stroke={T.bg2} strokeWidth="2"/>
              ))}
            </svg>
          )}
          {filtered.length>0&&(
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <div style={{fontSize:10,color:T.dim}}>{filtered[0]?.dateStr}</div>
              <div style={{fontSize:10,color:T.dim}}>{filtered[filtered.length-1]?.dateStr}</div>
            </div>
          )}
        </div>

        {/* Log new entry */}
        <div style={cs}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Log Today's {metric}</div>
          <div style={{display:"flex",gap:8}}>
            <input type="number" value={newVal} onChange={e=>setNewVal(e.target.value)} placeholder={metric==="Body Fat %"?"e.g. 18.5":"e.g. 174.2"}
              style={{...inp,flex:1,fontFamily:"'DM Mono',monospace"}}/>
            <button onClick={save} disabled={!newVal||saving} style={{...btn(newVal?T.green:"rgba(255,255,255,0.07)",newVal?"#000":T.dim),padding:"10px 16px",flexShrink:0}}>{saving?"…":"Log"}</button>
          </div>
        </div>

        {/* History list */}
        {filtered.length>0&&(
          <div style={cs}>
            <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>History</div>
            {[...filtered].reverse().map((e,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:i>0?`1px solid rgba(255,255,255,0.05)`:"none"}}>
                <div style={{fontSize:13,color:T.muted}}>{e.dateStr}</div>
                <div style={{fontSize:14,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{e.value}{metric==="Body Fat %"?"%":""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BarcodeScanner ────────────────────────────────────────────────────────────
function BarcodeScanner({onFood,onClose}) {
  const [status,setStatus]=useState("idle"); // idle|scanning|loading|found|error
  const [scannedFood,setScannedFood]=useState(null);
  const [errMsg,setErrMsg]=useState("");
  const [manual,setManual]=useState("");
  const videoRef=useRef(null);
  const scannerRef=useRef(null);
  const streamRef=useRef(null);

  const stop=useCallback(()=>{
    if(scannerRef.current){try{scannerRef.current.reset();}catch(e){}scannerRef.current=null;}
    if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}
  },[]);

  const lookup=useCallback(async(barcode)=>{
    setStatus("loading"); stop();
    try{
      const res=await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data=await res.json();
      if(data.status===1&&data.product){
        const p=data.product,n=p.nutriments||{};
        setScannedFood({id:Date.now(),name:p.product_name||"Unknown Product",cal100:Math.round(n["energy-kcal_100g"]||0),pro100:Math.round((n.proteins_100g||0)*10)/10,carb100:Math.round((n.carbohydrates_100g||0)*10)/10,fat100:Math.round((n.fat_100g||0)*10)/10,brand:p.brands||"",unit:"g",defaultGrams:parseInt(p.serving_size)||100});
        setStatus("found");
      } else { setErrMsg("Product not found in database."); setStatus("error"); }
    } catch(e){ setErrMsg("Network error — try manual entry."); setStatus("error"); }
  },[stop]);

  const startScan=useCallback(async()=>{
    setStatus("scanning"); setErrMsg(""); setScannedFood(null);
    try{
      const ZXing=await import("https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/esm/index.min.js");
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
      const reader=new ZXing.BrowserMultiFormatReader();
      scannerRef.current=reader;
      reader.decodeFromStream(stream,videoRef.current,r=>{if(r)lookup(r.getText());});
    } catch(e){
      setErrMsg(e.name==="NotAllowedError"?"Camera permission denied. Use manual entry below.":"Could not start camera. Use manual entry below.");
      setStatus("error");
    }
  },[lookup]);

  useEffect(()=>{ startScan(); return()=>stop(); },[]);

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:400,display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto"}}>
      <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><div style={{fontSize:12,color:T.muted,marginBottom:2}}>Food Search</div><div style={{fontSize:20,fontWeight:700}}>Barcode Scanner ⬛</div></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 16px 24px",gap:14}}>
        {(status==="scanning"||status==="loading")&&(
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",background:"#000",aspectRatio:"4/3"}}>
            <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"relative",width:"65%",aspectRatio:"3/2"}}>
                {[{top:0,left:0,borderTop:`3px solid ${T.green}`,borderLeft:`3px solid ${T.green}`},{top:0,right:0,borderTop:`3px solid ${T.green}`,borderRight:`3px solid ${T.green}`},{bottom:0,left:0,borderBottom:`3px solid ${T.green}`,borderLeft:`3px solid ${T.green}`},{bottom:0,right:0,borderBottom:`3px solid ${T.green}`,borderRight:`3px solid ${T.green}`}].map((s,i)=>(
                  <div key={i} style={{position:"absolute",width:22,height:22,borderRadius:2,...s}}/>
                ))}
                {status==="scanning"&&<div style={{position:"absolute",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${T.green},transparent)`,animation:"scanline 1.8s ease-in-out infinite"}}/>}
              </div>
            </div>
            {status==="loading"&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}><div style={{width:32,height:32,border:`3px solid rgba(34,197,94,0.2)`,borderTop:`3px solid ${T.green}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><div style={{fontSize:13,color:T.green}}>Looking up product…</div></div>}
          </div>
        )}
        {status==="found"&&scannedFood&&(
          <div style={{...cs,background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.25)",animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(34,197,94,0.15)",border:`2px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✓</div>
              <div><div style={{fontWeight:700,fontSize:15}}>{scannedFood.name}</div>{scannedFood.brand&&<div style={{fontSize:11,color:T.muted}}>{scannedFood.brand}</div>}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:14}}>
              {[{l:"Cal",v:scannedFood.cal100,c:T.green,u:""},{l:"Protein",v:scannedFood.pro100,c:T.blue,u:"g"},{l:"Carbs",v:scannedFood.carb100,c:T.amber,u:"g"},{l:"Fat",v:scannedFood.fat100,c:T.red,u:"g"}].map(m=>(
                <div key={m.l} style={{background:`${m.c}12`,borderRadius:9,padding:"8px 4px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:m.c,fontFamily:"'DM Mono',monospace"}}>{m.v}{m.u}</div>
                  <div style={{fontSize:9,color:T.muted}}>{m.l}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>onFood(scannedFood)} style={{...btn(),width:"100%",padding:12,fontSize:14}}>Set Serving & Add to Diary</button>
          </div>
        )}
        {status==="error"&&(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontSize:13,color:T.red,marginBottom:14}}>{errMsg}</div>
            <button onClick={startScan} style={{background:"rgba(34,197,94,0.15)",border:`1px solid rgba(34,197,94,0.3)`,borderRadius:10,padding:"9px 20px",color:T.green,fontSize:13,fontWeight:600,cursor:"pointer"}}>Try Again</button>
          </div>
        )}
        <div style={{...cs}}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Enter Barcode Manually</div>
          <div style={{display:"flex",gap:8}}>
            <input value={manual} onChange={e=>setManual(e.target.value.replace(/\D/g,""))} placeholder="e.g. 9300650104894" maxLength={14}
              style={{flex:1,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,fontFamily:"'DM Mono',monospace",outline:"none"}}/>
            <button onClick={()=>manual.length>=8&&lookup(manual)} disabled={manual.length<8}
              style={{...btn(manual.length>=8?T.green:"rgba(255,255,255,0.06)",manual.length>=8?"#000":T.dim),padding:"10px 14px",flexShrink:0}}>Look Up</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes scanline{0%,100%{top:8%}50%{top:86%}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── RecipeBuilder ────────────────────────────────────────────────────────────
function RecipeBuilder({recipes,setRecipes,onClose,onLogRecipe,activeMeal,allFoods}){
  const [view,setView]=useState("list");
  const [editRec,setEditRec]=useState(null);
  const [rName,setRName]=useState("");
  const [servings,setServings]=useState(4);
  const [ingredients,setIngredients]=useState([]);
  const [sq,setSq]=useState("");
  const [pickFood,setPickFood]=useState(null);
  const [srvToLog,setSrvToLog]=useState(1);
  const filtered=allFoods.filter(f=>f.name.toLowerCase().includes(sq.toLowerCase()));
  const totals=ingredients.reduce((a,i)=>({calories:a.calories+i.calories,protein:a.protein+i.protein,carbs:a.carbs+i.carbs,fat:a.fat+i.fat}),{calories:0,protein:0,carbs:0,fat:0});
  const perSrv=servings>0?{calories:Math.round(totals.calories/servings),protein:Math.round(totals.protein/servings*10)/10,carbs:Math.round(totals.carbs/servings*10)/10,fat:Math.round(totals.fat/servings*10)/10}:totals;
  const save=()=>{if(!rName.trim()||!ingredients.length)return;const r={id:editRec?.id||Date.now(),name:rName,servings,ingredients,totals,perServing:perSrv,created:editRec?.created||new Date().toLocaleDateString()};setRecipes(p=>editRec?p.map(x=>x.id===editRec.id?r:x):[...p,r]);setView("list");setRName("");setServings(4);setIngredients([]);setEditRec(null);};
  const startEdit=r=>{setEditRec(r);setRName(r.name);setServings(r.servings);setIngredients(r.ingredients);setView("create");};
  const MRow=({o})=>(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>{[{l:"Cal",v:o.calories,c:T.green,u:""},{l:"Protein",v:o.protein,c:T.blue,u:"g"},{l:"Carbs",v:o.carbs,c:T.amber,u:"g"},{l:"Fat",v:o.fat,c:T.red,u:"g"}].map(m=>(<div key={m.l} style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:m.c,fontFamily:"DM Mono,monospace"}}>{m.v}{m.u}</div><div style={{fontSize:9,color:T.muted}}>{m.l}</div></div>))}</div>);
  return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:350,display:"flex",flexDirection:"column",maxWidth:420,margin:"0 auto"}}><div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div>{view!=="list"&&<button onClick={()=>{setView("list");setRName("");setServings(4);setIngredients([]);setEditRec(null);}} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",padding:"0 0 4px",display:"block"}}>← Back</button>}<div style={{fontSize:20,fontWeight:700}}>{view==="list"?"🍳 Recipes":view==="create"?(editRec?"Edit Recipe":"New Recipe"):"Recipe"}</div></div><div style={{display:"flex",gap:8}}>{view==="list"&&<button onClick={()=>setView("create")} style={btn()}>+ New</button>}<button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:10,width:36,height:36,color:T.muted,fontSize:18,cursor:"pointer"}}>×</button></div></div><div style={{flex:1,overflowY:"auto",padding:"0 16px 32px"}}>{view==="list"&&(<>{recipes.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:T.dim}}><div style={{fontSize:44,marginBottom:10}}>🍳</div><div style={{fontSize:14,color:T.muted}}>No recipes yet — tap + New</div></div>}{recipes.map(r=>(<div key={r.id} style={cs}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{fontWeight:700,fontSize:15}}>{r.name}</div><div style={{fontSize:11,color:T.muted}}>{r.servings} servings · {r.ingredients.length} ingredients</div></div><button onClick={()=>{setEditRec(r);setSrvToLog(1);setView("detail");}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"5px 10px",color:T.muted,fontSize:12,cursor:"pointer"}}>View</button></div><MRow o={r.perServing}/>{activeMeal&&<button onClick={()=>onLogRecipe(r,1)} style={{...btn(),marginTop:10,width:"100%",fontSize:12,padding:"8px"}}>Log 1 serving → {activeMeal}</button>}</div>))}</>)}{view==="create"&&(<><div style={cs}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Recipe Name</div><input value={rName} onChange={e=>setRName(e.target.value)} placeholder="e.g. Meal Prep Bowl" style={inp}/></div><div style={cs}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Total Servings</div><div style={{display:"flex",alignItems:"center",gap:14}}><button onClick={()=>setServings(s=>Math.max(1,s-1))} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:T.text,fontSize:18,cursor:"pointer"}}>−</button><div style={{fontSize:22,fontWeight:700,fontFamily:"DM Mono,monospace",minWidth:32,textAlign:"center"}}>{servings}</div><button onClick={()=>setServings(s=>s+1)} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:T.text,fontSize:18,cursor:"pointer"}}>+</button><div style={{fontSize:13,color:T.muted}}>servings</div></div></div><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Ingredients ({ingredients.length})</div>{ingredients.map((ing,i)=>(<div key={i} style={{...cs,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:600}}>{ing.name}</div><div style={{fontSize:11,color:T.muted}}>{ing.grams}{ing.unit} · {ing.calories} kcal</div></div><button onClick={()=>setIngredients(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.dim,fontSize:18,cursor:"pointer"}}>×</button></div>))}<div style={cs}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Add Ingredient</div><input value={sq} onChange={e=>setSq(e.target.value)} placeholder="Search foods…" style={{...inp,marginBottom:8}}/><div style={{maxHeight:160,overflowY:"auto"}}>{sq&&filtered.map(f=>(<button key={f.id} onClick={()=>{setPickFood(f);setSq("");}} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid rgba(255,255,255,0.05)`,padding:"8px 0",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,color:T.text}}>{f.name}{f.custom?" ⭐":""}</div><div style={{fontSize:11,color:T.green,fontFamily:"DM Mono,monospace"}}>{f.cal100}/100{f.unit}</div></button>))}</div></div>{ingredients.length>0&&<div style={{...cs,background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)"}}><div style={{fontSize:11,color:T.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Per Serving</div><MRow o={perSrv}/></div>}<button onClick={save} disabled={!rName.trim()||!ingredients.length} style={{...btn(rName.trim()&&ingredients.length?T.green:"rgba(255,255,255,0.08)",rName.trim()&&ingredients.length?"#000":T.dim),width:"100%",padding:13,fontSize:14,marginTop:4}}>{editRec?"Save Changes":"Save Recipe"}</button></>)}{view==="detail"&&editRec&&(<><div style={{...cs,background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.15)"}}><div style={{fontWeight:700,fontSize:16,marginBottom:2}}>{editRec.name}</div><div style={{fontSize:12,color:T.muted,marginBottom:10}}>{editRec.servings} servings</div><MRow o={editRec.perServing}/></div>{editRec.ingredients.map((ing,i)=>(<div key={i} style={{...cs,display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:500}}>{ing.name}</div><div style={{fontSize:12,color:T.muted,fontFamily:"DM Mono,monospace"}}>{ing.grams}{ing.unit}</div></div>))}{activeMeal&&<div style={cs}><div style={{fontSize:12,color:T.muted,marginBottom:10}}>Log to {activeMeal}</div><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><button onClick={()=>setSrvToLog(s=>Math.max(0.5,Math.round((s-0.5)*2)/2))} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:T.text,fontSize:18,cursor:"pointer"}}>−</button><div style={{fontSize:20,fontWeight:700,fontFamily:"DM Mono,monospace",minWidth:32,textAlign:"center"}}>{srvToLog}</div><button onClick={()=>setSrvToLog(s=>Math.round((s+0.5)*2)/2)} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"none",color:T.text,fontSize:18,cursor:"pointer"}}>+</button></div><button onClick={()=>onLogRecipe(editRec,srvToLog)} style={{...btn(),width:"100%",padding:11,fontSize:13}}>Log {srvToLog} serving{srvToLog!==1?"s":""} → {activeMeal}</button></div>}<div style={{display:"flex",gap:8,marginTop:4}}><button onClick={()=>startEdit(editRec)} style={{...btn("rgba(255,255,255,0.07)",T.muted),flex:1,padding:10}}>Edit</button><button onClick={()=>{setRecipes(p=>p.filter(r=>r.id!==editRec.id));setView("list");}} style={{...btn("rgba(239,68,68,0.12)",T.red),flex:1,padding:10}}>Delete</button></div></>)}</div>{pickFood&&<GramPicker food={pickFood} onConfirm={s=>{setIngredients(p=>[...p,{...s,uid:Date.now()}]);setPickFood(null);}} onClose={()=>setPickFood(null)}/>}</div>);
}
// ─── ClientApp ────────────────────────────────────────────────────────────────
function ClientApp({user,onLogout,hideSignOut,setCoachMode}) {
  const [tab,setTab]=useState("dashboard");
  const [goals,setGoals]=useState(DEMO_ACCOUNTS[user.email]?.goals||{calories:2000,protein:150,carbs:200,fat:67});
  const [diary,setDiary]=useState({Breakfast:[],Lunch:[],Dinner:[],Snacks:[]});
  const [searchQuery,setSearchQuery]=useState("");
  const [activeMeal,setActiveMeal]=useState(null);
  const [showSearch,setShowSearch]=useState(false);
  const [pickingFood,setPickingFood]=useState(null);
  const [waterGlasses,setWaterGlasses]=useState(0);
  const [habits,setHabits]=useState(()=>Object.fromEntries(HABITS.map(h=>[h,false])));
  const [syncing,setSyncing]=useState(false);
  const [lastSync,setLastSync]=useState(null);
  const [customFoods,setCustomFoods]=useState([]);
  const [recipes,setRecipes]=useState([]);
  const [showRecipes,setShowRecipes]=useState(false);
  const [showScanner,setShowScanner]=useState(false);
  const [showGraph,setShowGraph]=useState(false);
  const [showMsg,setShowMsg]=useState(false);
  const [showCheckin,setShowCheckin]=useState(false);
  const [showPhotos,setShowPhotos]=useState(false);
  const [unreadMsgs,setUnreadMsgs]=useState(0);
  const [coachGoalsUpdated,setCoachGoalsUpdated]=useState(false);
  const syncTimer=useRef(null);

  const allFoods=[...BASE_FOODS,...customFoods];
  const filteredFoods=allFoods.filter(f=>f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totals=Object.values(diary).flat().reduce((a,i)=>({calories:a.calories+i.calories,protein:a.protein+i.protein,carbs:a.carbs+i.carbs,fat:a.fat+i.fat}),{calories:0,protein:0,carbs:0,fat:0});
  const remaining={calories:goals.calories-totals.calories,protein:goals.protein-totals.protein,carbs:goals.carbs-totals.carbs,fat:goals.fat-totals.fat};
  const pct=(v,g)=>Math.min(100,Math.round((v/(g||1))*100));
  const habitsDone=Object.values(habits).filter(Boolean).length;

  // Load on mount
  useEffect(()=>{
    const load=async()=>{
      const d=await store.get(`client_diary:${user.id}:${TODAY}`);
      if(d?.diary) setDiary(d.diary);
      if(d?.habits) setHabits(d.habits);
      if(d?.water) setWaterGlasses(d.water);
      // Load coach-set goals
      const coachGoals=await store.get(`client_goals:${user.id}`);
      if(coachGoals){ setGoals(coachGoals); setCoachGoalsUpdated(true); setTimeout(()=>setCoachGoalsUpdated(false),5000); }
      // Unread messages
      const msgs=await store.get(`chat:${["coach1",user.id].sort().join(":")}`)||[];
      const readData=await store.get(`chat_read:${user.id}:coach1`);
      const readTs=readData?.ts||"";
      setUnreadMsgs(msgs.filter(m=>m.senderId!=="coach1"?false:m.ts>readTs).length);
    };
    load();
    const iv=setInterval(async()=>{
      const coachGoals=await store.get(`client_goals:${user.id}`);
      if(coachGoals) setGoals(coachGoals);
      const msgs=await store.get(`chat:${["coach1",user.id].sort().join(":")}`)||[];
      const readData=await store.get(`chat_read:${user.id}:coach1`);
      const readTs=readData?.ts||"";
      setUnreadMsgs(msgs.filter(m=>m.senderId==="coach1"&&m.ts>readTs).length);
    },15000);
    return()=>clearInterval(iv);
  },[]);

  // Auto-sync diary
  const syncToCloud=useCallback(async(diaryData,habitsData,waterData)=>{
    setSyncing(true);
    await store.set(`client_diary:${user.id}:${TODAY}`,{diary:diaryData,habits:habitsData,water:waterData,lastSynced:ts()});
    setLastSync(new Date().toLocaleTimeString());
    setSyncing(false);
  },[user.id]);

  useEffect(()=>{
    clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(()=>syncToCloud(diary,habits,waterGlasses),1500);
    return()=>clearTimeout(syncTimer.current);
  },[diary,habits,waterGlasses]);

  const addFood=s=>{setDiary(prev=>({...prev,[activeMeal]:[...prev[activeMeal],{...s,uid:Date.now()+Math.random()}]}));setPickingFood(null);setShowSearch(false);setSearchQuery("");};
  const removeFood=(meal,uid)=>setDiary(prev=>({...prev,[meal]:prev[meal].filter(f=>f.uid!==uid)}));
  const logRecipe=(recipe,count)=>{const e={uid:Date.now()+Math.random(),name:`${recipe.name} (${count} srv)`,calories:Math.round(recipe.perServing.calories*count),protein:Math.round(recipe.perServing.protein*count*10)/10,carbs:Math.round(recipe.perServing.carbs*count*10)/10,fat:Math.round(recipe.perServing.fat*count*10)/10,grams:null,unit:"srv"};setDiary(prev=>({...prev,[activeMeal]:[...prev[activeMeal],e]}));setShowRecipes(false);setShowSearch(false);};

  const RadialProgress=({value,goal,size=110,stroke=9,color,children})=>{
    const r=(size-stroke)/2,circ=2*Math.PI*r,offset=circ-(pct(value,goal)/100)*circ;
    return(<div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/></svg><div style={{position:"relative",zIndex:1,textAlign:"center"}}>{children}</div></div>);
  };
  const MiniBar=({value,goal,color,label})=>(<div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</span><span style={{fontSize:11,color,fontFamily:"'DM Mono',monospace"}}>{value}g</span></div><div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct(value,goal)}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.5s ease"}}/></div><div style={{fontSize:10,color:T.muted,marginTop:3,fontFamily:"'DM Mono',monospace"}}>{goal}g goal</div></div>);

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",maxWidth:420,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{paddingBottom:80}}>

        {/* ── TODAY ── */}
        {tab==="dashboard"&&(
          <div>
            <div style={{padding:"20px 20px 0",background:`linear-gradient(180deg,${T.bg2} 0%,transparent 100%)`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:2}}>{todayStr}</div>
                  <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em"}}>Hey, {user.name.split(" ")[0]} 👋</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  {!hideSignOut && <button onClick={onLogout} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",color:T.muted,fontSize:11,cursor:"pointer"}}>Sign Out</button>}
                  <div style={{fontSize:10,color:syncing?T.amber:T.green,display:"flex",alignItems:"center",gap:3}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:syncing?T.amber:T.green,animation:syncing?"pulse 1s infinite":"none"}}/>
                    {syncing?"Syncing…":lastSync?`Synced ${lastSync}`:"Waiting…"}
                  </div>
                </div>
              </div>
              {/* Coach goal update banner */}
              {coachGoalsUpdated&&<div style={{background:"rgba(251,146,60,0.12)",border:"1px solid rgba(251,146,60,0.3)",borderRadius:10,padding:"8px 12px",marginBottom:12,fontSize:12,color:T.orange}}>⚡ Your coach just updated your macro goals!</div>}
            </div>
            <div style={{padding:"0 16px"}}>
              {/* Coach quick actions — hide when coach is in personal mode */}
              {!hideSignOut && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[
                  {l:"💬 Coach",bg:"rgba(139,92,246,0.12)",c:T.purple,fn:()=>setShowMsg(true),badge:unreadMsgs},
                  {l:"📋 Check-in",bg:"rgba(59,130,246,0.10)",c:T.blue,fn:()=>setShowCheckin(true)},
                  {l:"📸 Photos",bg:"rgba(236,72,153,0.10)",c:T.pink,fn:()=>setShowPhotos(true)},
                  {l:"📈 Progress",bg:"rgba(34,197,94,0.10)",c:T.green,fn:()=>setShowGraph(true)},
                ].map(a=>(
                  <button key={a.l} onClick={a.fn} style={{position:"relative",background:a.bg,border:`1px solid ${a.c}33`,borderRadius:12,padding:"10px 6px",color:a.c,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                    {a.l}
                    {a.badge>0&&<div style={{position:"absolute",top:4,right:6,background:T.red,color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{a.badge}</div>}
                  </button>
                ))}
              </div>
              )}

              {/* Calorie ring */}
              <div style={{...cs,display:"flex",alignItems:"center",gap:18}}>
                <RadialProgress value={totals.calories} goal={goals.calories} color={T.green}>
                  <div style={{fontSize:18,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{totals.calories}</div>
                  <div style={{fontSize:9,color:T.muted,letterSpacing:"0.05em"}}>KCAL</div>
                </RadialProgress>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div><div style={{fontSize:11,color:T.muted}}>Consumed</div><div style={{fontSize:16,fontWeight:700}}>{totals.calories}</div></div>
                    <div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.muted}}>Remaining</div><div style={{fontSize:16,fontWeight:700,color:remaining.calories>=0?T.green:T.red}}>{Math.abs(remaining.calories)}</div></div>
                  </div>
                  <div style={{height:1,background:T.border,marginBottom:8}}/>
                  <div style={{fontSize:11,color:T.muted}}>Goal: <span style={{color:T.text}}>{goals.calories} kcal</span></div>
                </div>
              </div>
              <div style={cs}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Macros</div>
                <div style={{display:"flex",gap:12}}><MiniBar value={totals.protein} goal={goals.protein} color={T.blue} label="Protein"/><MiniBar value={totals.carbs} goal={goals.carbs} color={T.amber} label="Carbs"/><MiniBar value={totals.fat} goal={goals.fat} color={T.red} label="Fat"/></div>
              </div>

              {/* Habits */}
              <div style={cs}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Today's Habits</div>
                  <div style={{fontSize:12,color:T.orange}}>🔥 {habitsDone}/{HABITS.length}</div>
                </div>
                {HABITS.map(h=>(
                  <button key={h} onClick={()=>setHabits(prev=>({...prev,[h]:!prev[h]}))} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:"5px 0",width:"100%"}}>
                    <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${habits[h]?T.green:T.dim}`,background:habits[h]?"rgba(34,197,94,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>{habits[h]&&<div style={{color:T.green,fontSize:12,fontWeight:700}}>✓</div>}</div>
                    <div style={{fontSize:13,color:habits[h]?T.text:T.muted,textDecoration:habits[h]?"line-through":"none",transition:"all 0.2s"}}>{h}</div>
                  </button>
                ))}
              </div>

              {/* Water */}
              <div style={cs}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Water</div>
                  <div style={{fontSize:12,color:T.blue}}>{waterGlasses} / 8</div>
                </div>
                <div style={{display:"flex",gap:6}}>{Array.from({length:8},(_,i)=>(<button key={i} onClick={()=>setWaterGlasses(i+1)} style={{flex:1,height:30,borderRadius:6,border:"none",cursor:"pointer",background:i<waterGlasses?T.blue:"rgba(59,130,246,0.12)",transition:"background 0.2s"}}/>))}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── DIARY ── */}
        {tab==="diary"&&(
          <div>
            <div style={{padding:"20px 20px 0",background:`linear-gradient(180deg,${T.bg2} 0%,transparent 100%)`}}>
              <div style={{marginBottom:12}}><div style={{fontSize:12,color:T.muted,marginBottom:2}}>Food Diary</div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>Log Meals</div></div>
              <div style={{...cs,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:12,color:T.muted}}>Calories</span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:remaining.calories>=0?T.green:T.red}}>{totals.calories} / {goals.calories}</span></div>
                <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:4,overflow:"hidden"}}><div style={{width:`${pct(totals.calories,goals.calories)}%`,height:"100%",background:pct(totals.calories,goals.calories)>100?T.red:T.green,borderRadius:4,transition:"width 0.4s ease"}}/></div>
              </div>
            </div>
            <div style={{padding:"0 16px"}}>
              {MEALS.map(meal=>{
                const mf=diary[meal],mc=mf.reduce((a,f)=>a+f.calories,0);
                return (
                  <div key={meal} style={cs}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div><div style={{fontWeight:600,fontSize:15}}>{meal}</div><div style={{fontSize:11,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{mc} kcal</div></div>
                      <button onClick={()=>{setActiveMeal(meal);setShowSearch(true);}} style={{background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:8,padding:"6px 12px",color:T.green,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Add</button>
                    </div>
                    {mf.length===0&&<div style={{fontSize:12,color:T.dim,textAlign:"center",padding:"6px 0"}}>Nothing logged yet</div>}
                    {mf.map(food=>(
                      <div key={food.uid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:`1px solid rgba(255,255,255,0.05)`}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:500}}>{food.name}</div>
                          <div style={{fontSize:11,color:T.muted}}>{food.grams!=null?`${food.grams}${food.unit} · `:""}<span style={{color:T.blue}}>P:{food.protein}g</span> · <span style={{color:T.amber}}>C:{food.carbs}g</span> · <span style={{color:T.red}}>F:{food.fat}g</span></div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{fontSize:13,fontWeight:600,color:T.green,fontFamily:"'DM Mono',monospace"}}>{food.calories}</div>
                          <button onClick={()=>removeFood(meal,food.uid)} style={{background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:17,padding:0}}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab==="profile"&&(
          <div>
            <div style={{padding:"20px 20px 0",background:`linear-gradient(180deg,${T.bg2} 0%,transparent 100%)`,marginBottom:4}}>
              <div style={{fontSize:12,color:T.muted,marginBottom:2}}>My Profile</div>
              <div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",marginBottom:16}}>Settings</div>
            </div>
            <div style={{padding:"0 16px"}}>
              <div style={cs}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>My Macro Goals</div>
                <div style={{fontSize:11,color:T.amber,marginBottom:12}}>⚡ Your coach may update these remotely</div>
                {[{l:"Calories",k:"calories",u:"kcal",c:T.green,min:1000,max:4000},{l:"Protein",k:"protein",u:"g",c:T.blue,min:50,max:400},{l:"Carbs",k:"carbs",u:"g",c:T.amber,min:50,max:500},{l:"Fat",k:"fat",u:"g",c:T.red,min:20,max:200}].map(f=>(
                  <div key={f.k} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><label style={{fontSize:13,color:f.c}}>{f.l}</label><span style={{fontSize:12,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{goals[f.k]} {f.u}</span></div>
                    <input type="range" min={f.min} max={f.max} value={goals[f.k]} onChange={e=>setGoals(p=>({...p,[f.k]:Number(e.target.value)}))} style={{width:"100%",accentColor:f.c}}/>
                  </div>
                ))}
              </div>
              <div style={cs}>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Custom Foods ({customFoods.length})</div>
                {customFoods.length===0&&<div style={{fontSize:12,color:T.dim,marginBottom:10}}>No custom foods yet</div>}
                {customFoods.map(f=>(
                  <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderTop:`1px solid rgba(255,255,255,0.05)`}}>
                    <div><div style={{fontSize:13,fontWeight:500}}>⭐ {f.name}</div><div style={{fontSize:11,color:T.muted}}>{f.cal100} kcal/100{f.unit}</div></div>
                    <button onClick={()=>setCustomFoods(prev=>prev.filter(x=>x.id!==f.id))} style={{background:"none",border:"none",color:T.dim,fontSize:17,cursor:"pointer"}}>×</button>
                  </div>
                ))}
                <button onClick={()=>{
                  const name=prompt("Food name?"); if(!name) return;
                  const cal=Number(prompt("Calories per 100g?")||0);
                  const pro=Number(prompt("Protein per 100g?")||0);
                  const carb=Number(prompt("Carbs per 100g?")||0);
                  const fat=Number(prompt("Fat per 100g?")||0);
                  setCustomFoods(p=>[...p,{id:Date.now(),name,cal100:cal,pro100:pro,carb100:carb,fat100:fat,unit:"g",defaultGrams:100,custom:true}]);
                }} style={{...btn("rgba(34,197,94,0.15)",T.green),width:"100%",padding:10,marginTop:8,border:"1px solid rgba(34,197,94,0.3)"}}>+ Add Custom Food</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search modal */}
      {showSearch&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{background:T.bg2,borderRadius:"20px 20px 0 0",padding:18,maxHeight:"82vh",display:"flex",flexDirection:"column",border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:15}}>Add to {activeMeal}</div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <button onClick={()=>setShowRecipes(true)} style={{background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:8,padding:"5px 9px",color:T.purple,fontSize:11,fontWeight:600,cursor:"pointer"}}>🍳 Recipes</button>
                <button onClick={()=>setShowScanner(true)} style={{background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:8,padding:"5px 9px",color:T.green,fontSize:11,fontWeight:600,cursor:"pointer"}}>⬛ Scan</button>
                <button onClick={()=>{setShowSearch(false);setSearchQuery("");}} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>×</button>
              </div>
            </div>
            <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search foods..." style={{...inp,marginBottom:10}}/>
            <div style={{overflowY:"auto",flex:1}}>
              {filteredFoods.map(food=>(
                <button key={food.id} onClick={()=>setPickingFood(food)} style={{width:"100%",background:"none",border:"none",borderBottom:`1px solid rgba(255,255,255,0.05)`,padding:"11px 0",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>{food.custom?"⭐ ":""}{food.name}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:1}}>per 100{food.unit} · <span style={{color:T.blue}}>P:{food.pro100}g</span> · <span style={{color:T.amber}}>C:{food.carb100}g</span> · <span style={{color:T.red}}>F:{food.fat100}g</span></div>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:T.green,fontFamily:"'DM Mono',monospace"}}>{food.cal100}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pickingFood&&<GramPicker food={pickingFood} onConfirm={addFood} onClose={()=>setPickingFood(null)}/>}
      {showRecipes&&<RecipeBuilder recipes={recipes} setRecipes={setRecipes} onClose={()=>setShowRecipes(false)} onLogRecipe={logRecipe} activeMeal={activeMeal} allFoods={allFoods}/>}
      {showScanner&&<BarcodeScanner onFood={f=>{setPickingFood(f);setShowScanner(false);}} onClose={()=>setShowScanner(false)}/>}
      {showGraph&&<ProgressGraph userId={user.id} onClose={()=>setShowGraph(false)}/>}
      {showMsg&&<MessagingPanel myId={user.id} myName={user.name} otherIds={["coach1"]} isCoach={false} onClose={()=>{setShowMsg(false);setUnreadMsgs(0);}}/>}
      {showCheckin&&<WeeklyCheckIn userId={user.id} onClose={()=>setShowCheckin(false)}/>}
      {showPhotos&&<ProgressPhotos userId={user.id} isCoach={false} onClose={()=>setShowPhotos(false)}/>}

      {/* Nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,display:"flex",padding:"8px 0 16px",zIndex:100}}>
        {[{id:"dashboard",icon:"⬡",label:"Today"},{id:"diary",icon:"✎",label:"Diary"},{id:"profile",icon:"◎",label:"Profile"}].map(({id,icon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0",background:"none",border:"none",cursor:"pointer",color:tab===id?T.green:T.dim,transition:"color 0.2s"}}>
            <span style={{fontSize:18}}>{icon}</span>
            <span style={{fontSize:9,letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session,setSession]=useState(null);
  const [coachMode,setCoachMode]=useState("coaching");

  if(!session) return <LoginScreen onLogin={(acct,email)=>setSession({...acct,email})}/>;

  if(session.role==="coach") {
    if(coachMode==="personal") {
      const coachAsUser={...session,id:"coach1_personal",role:"client"};
      return (
        <div style={{position:"relative"}}>
          <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:900,background:"rgba(10,10,15,0.96)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:40,padding:"4px 5px",display:"flex",gap:3,boxShadow:"0 4px 24px rgba(0,0,0,0.6)"}}>
            <button onClick={()=>setCoachMode("coaching")} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:32,padding:"6px 14px",color:"#9ca3af",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>🏋️ Coach View</button>
            <button onClick={()=>setCoachMode("personal")} style={{background:"#38bdf8",border:"none",borderRadius:32,padding:"6px 14px",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>👤 My Tracking</button>
          </div>
          <div style={{height:52}}/>
          <ClientApp user={coachAsUser} onLogout={()=>setSession(null)} hideSignOut={true}/>
        </div>
      );
    }
    return <CoachDashboard coach={session} onLogout={()=>setSession(null)} setCoachMode={setCoachMode}/>;
  }

  return <ClientApp user={session} onLogout={()=>setSession(null)}/>;
}
