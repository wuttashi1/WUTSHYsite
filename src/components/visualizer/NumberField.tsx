"use client";
import {useState,type InputHTMLAttributes} from 'react';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'|'type'> & {value:number;onValue:(n:number)=>void;min?:number;max?:number};
export function NumberField({value,onValue,min,max,...props}:Props){
 const [draft,setDraft]=useState<string|null>(null);
 function commit(){if(draft!==null&&draft.trim()!==''&&Number.isFinite(Number(draft)))onValue(Math.max(min??-Infinity,Math.min(max??Infinity,Number(draft))));setDraft(null);}
 return <input {...props} type="number" min={min} max={max} value={draft??value} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){setDraft(String(value));}}}/>;
}
