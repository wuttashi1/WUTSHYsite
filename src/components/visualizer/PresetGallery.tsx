"use client";
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {renderFrame} from '@/lib/visualizer/render';
import {presetConfig,looks,presetIds,type PresetId,type MidiLayer} from '@/lib/visualizer/types';
const demo:MidiLayer[]=[{id:'preview',name:'Preview sequence',channel:0,instrument:'Synth',enabled:true,color:'#eabaff',offset:0,repeat:true,length:4,notes:[60,67,63,72,65,70,67,75].map((midi,i)=>({id:String(i),midi,time:i*.5,duration:.3,velocity:.65+(i%3)*.15}))}];
function Card({id,selected,onSelect,active,activate,deactivate}:{id:PresetId;selected?:PresetId;onSelect?:(id:PresetId)=>void;active:boolean;activate:()=>void;deactivate:()=>void}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,config={...presetConfig(id),textSize:18,title:''};
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,timer:ReturnType<typeof setTimeout>|undefined,visible=false,last=0,painted=false;
  const start=performance.now();
  const paint=(time:number)=>{renderFrame(ctx,360,240,time,config,demo);painted=true;};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;if(timer!==undefined){clearTimeout(timer);timer=undefined;}};
  function draw(now:number){frame=0;if(!visible||document.hidden||!active||motion.matches)return;if(now-last>=1000/20){last=now;paint(1.25+(now-start)/1000);}frame=requestAnimationFrame(draw);}
  function sync(){stop();if(!visible||document.hidden)return;if(active&&!motion.matches){frame=requestAnimationFrame(draw);}else if(!painted){timer=setTimeout(()=>{timer=undefined;paint(1.25);},30);}}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.05});
  observer.observe(canvas);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  return()=>{stop();observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync);};
 },[id,active]);
 const content=<><canvas ref={ref} width={360} height={240} aria-label={`${looks[id].name} MIDI demo`}/><span className="v-preset-name">{looks[id].name}<span>{selected===id?'✓':'↗'}</span></span><span className="v-hint">{looks[id].description}</span></>;
 const events={onMouseEnter:activate,onMouseLeave:deactivate,onFocus:activate,onBlur:deactivate};
 return onSelect?<button {...events} type="button" className="v-preset-card" aria-pressed={selected===id} onClick={()=>onSelect(id)}>{content}</button>:<Link {...events} prefetch={false} className="v-preset-card" href={`/admin/visualizer/editor?preset=${id}`} onClick={()=>{try{sessionStorage.setItem('visualizer-preset',id);}catch{ /* URL also carries the selection. */ }}}>{content}</Link>;
}
export function PresetGallery({selected,onSelect}:{selected?:PresetId;onSelect?:(id:PresetId)=>void}){
 const [active,setActive]=useState<PresetId|null>(null);
 return <div className={onSelect?'v-preset-strip':'v-gallery'}>{presetIds.map(id=><Card key={id} id={id} selected={selected} onSelect={onSelect} active={active===id} activate={()=>setActive(id)} deactivate={()=>setActive(current=>current===id?null:current)}/>)}</div>;
}
