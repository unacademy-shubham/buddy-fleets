import React, { useEffect, useState } from 'react';

export default function CompanyAnnouncementPopup(){
  const [items,setItems]=useState([]); const current=items[0]||null;
  async function load(){
    try{const r=await fetch('/api/company/announcements',{credentials:'include',cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d.ok)setItems(d.announcements||[]);}catch{}
  }
  useEffect(()=>{load();const id=setInterval(load,60000);return()=>clearInterval(id)},[]);
  async function mark(action){if(!current)return;try{await fetch('/api/company/announcements',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({announcementId:current.id,action})});}catch{}setItems(v=>v.slice(1));}
  if(!current)return null;
  return <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between gap-3"><div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${current.priority==='critical'?'bg-red-100 text-red-700':current.priority==='important'?'bg-amber-100 text-amber-700':'bg-cyan-100 text-cyan-700'}`}>{current.priority}</div><span className="text-[10px] text-slate-400">Buddy Fleets Announcement</span></div>
      <h3 className="mt-4 text-xl font-black text-slate-900">{current.title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{current.message}</p>
      <div className="mt-6 flex justify-end gap-2">{current.allow_dismiss&&!current.require_acknowledgement&&<button onClick={()=>mark('seen')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Dismiss</button>}<button onClick={()=>mark('acknowledge')} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white">{current.require_acknowledgement?'Acknowledge':'Got it'}</button></div>
    </div>
  </div>;
}
