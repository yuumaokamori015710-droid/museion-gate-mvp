"use client";
import { useId, useRef, useState } from "react";
import { SUPPORT_CONFIG } from "../lib/support-config";
import { inquiryMailto, copyEmail } from "../lib/support-contact";
export default function SupportContact(){
 const id=useId(),input=useRef<HTMLInputElement>(null);
 const [status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const href=inquiryMailto(SUPPORT_CONFIG);
 async function copy(){
  setBusy(true);setStatus("");let copied=false;
  try{copied=await copyEmail(SUPPORT_CONFIG.email,navigator.clipboard);}catch{}
  if(copied)setStatus("メールアドレスをコピーしました。");
  else{input.current?.focus();input.current?.select();setStatus("コピーできませんでした。アドレスを選択して手動でコピーしてください。");}
  setBusy(false);
 }
 if(!href)return null;
 return <section className="business-support-card" aria-label="運営へのお問い合わせ">
  <p>{SUPPORT_CONFIG.appName}の使い方や不具合について、運営者へご連絡いただけます。</p>
  <label htmlFor={id}>メールアドレス</label>
  <input ref={input} id={id} readOnly value={SUPPORT_CONFIG.email} inputMode="email" onFocus={e=>e.currentTarget.select()}/>
  <div className="business-support-actions"><a href={href}>メールで問い合わせる</a><button type="button" disabled={busy} onClick={()=>void copy()}>メールアドレスをコピー</button></div>
  <p>メールアプリが開きます。内容を入力し、ご自身で送信してください。</p>
  <p>開かない場合は、アドレスをコピーして普段のメールから送信できます。</p>
  <p className="business-support-status" role="status" aria-live="polite">{status}</p>
 </section>;
}
