import type {Config,Features,MidiLayer,PresetId} from './types';
import {activeNotes,noteName} from './midi';
import {cinematicRenderers} from './cinematic';
import {instrumentRenderers} from './instruments';
import {artDirection,directions} from './art-direction';
type Ctx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
interface Scene{ctx:Ctx;w:number;h:number;t:number;c:Config;f:number[];spectrum:number[];wave:number[];notes:ReturnType<typeof activeNotes>;layers:MidiLayer[];}
const tau=Math.PI*2;
const noise=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
function dot(ctx:Ctx,x:number,y:number,r:number){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,tau);ctx.fill();}
function line(ctx:Ctx,points:number[][]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function tracker(s:Scene,x:number,y:number,r:number,label:string){const {ctx,c}=s;ctx.strokeStyle=c.secondary;ctx.lineWidth=c.lineWidth;ctx.strokeRect(x-r,y-r,r*2,r*2);if(c.labels){ctx.fillStyle=c.textColor;ctx.font=`10px ${c.font}`;ctx.fillText(label,x-r,y-r-8);}}
// Time-derived events keep preview, seeking and offline export identical.
function recent(s:Scene,tail=1.2){
 const result:ReturnType<typeof activeNotes>=[];
 for(const layer of s.layers){
  if(!layer.enabled||s.t<layer.offset)continue;
  const elapsed=s.t-layer.offset,period=layer.repeat&&layer.length>0?layer.length:0,local=period?elapsed%period:elapsed;
  for(const note of layer.notes){let age=local-note.time;if(age<0&&period&&elapsed>=period)age+=period;
   if(age>=0&&age<note.duration+tail){result.push({note,layer,age});if(result.length>=48)return result;}
  }
 }
 return result;
}
function pulse(age:number,duration:number){return Math.min(1,age/.035)*Math.exp(-Math.max(0,age-duration)*4);}
function caption(s:Scene,text:string,x:number,y:number){if(!s.c.labels)return;s.ctx.save();s.ctx.shadowBlur=0;s.ctx.fillStyle=s.c.textColor;s.ctx.font=`${Math.max(9,s.w*.014)}px ${s.c.font}`;s.ctx.fillText(text,x,y);s.ctx.restore();}
const renderers:Record<PresetId,(s:Scene)=>void>={
 ...cinematicRenderers,
 ...instrumentRenderers,
 'blob-mono':s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s),flow=t*c.speed;
  const attractors=hits.map(({note,age})=>({a:note.midi/12*tau,r:pulse(age,note.duration)*note.velocity*c.velocity}));
  ctx.fillStyle=c.accent;
  for(let i=0;i<c.density;i++){
   const a=i*2.39996+flow*.12,z=noise(i+17)*2-1,r=Math.sqrt(1-z*z)*m*.29*c.size;
   const pull=attractors.reduce((v,n)=>v+Math.exp(-Math.pow(Math.sin((a-n.a)/2)*3,2))*n.r,0);
   const x=w/2+Math.cos(a)*(r+Math.sin(a*3+flow)*m*.025+pull*m*.035*c.intensity),y=h/2+z*m*.3*c.size+Math.sin(a*2+flow)*m*.035;
   ctx.globalAlpha=c.opacity*(.18+.82*(Math.sin(a)+1)/2);dot(ctx,x,y,(.6+noise(i)*1.5)*w/540*(1+f[0]*.3));
  }
  ctx.globalAlpha=c.opacity*.65;tracker(s,w/2,h/2,m*.34*c.size,'MORPH / '+String(hits.length).padStart(2,'0'));
  for(const {note,age} of hits.slice(0,5)){const a=note.midi/12*tau+flow*.12,x=w/2+Math.cos(a)*m*.25*c.size,y=h/2+Math.sin(a)*m*.25*c.size;ctx.globalAlpha=c.opacity*pulse(age,note.duration);tracker(s,x,y,m*.025,noteName(note.midi));}
 },
 'blob-thermal':s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s,.65),flow=t*c.speed;
  const sources=Array.from({length:9},(_,i)=>({x:.5+Math.sin(flow*.37+i*2.4)*.22,y:.5+Math.cos(flow*.29+i*1.7)*.28,p:.55+f[0]*.3}));
  for(const {note,age} of hits.slice(0,12))sources.push({x:.22+noise(note.midi*7+note.time)*.56,y:.2+noise(note.midi*11+note.time)*.6,p:pulse(age,note.duration)*note.velocity*c.velocity*1.4});
  const cell=m/85,cols=Math.ceil(w/cell),rows=Math.ceil(h/cell),palette=['#0a0610','#19082e','#390b55','#731565',c.secondary,c.accent,'#ffbd48','#fff29a'];
  ctx.shadowBlur=0;ctx.globalAlpha=c.opacity;
  for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
   const x=(ix*cell-w/2)/(m*c.size)+.5,y=(iy*cell-h/2)/(m*c.size)+.5;
   let value=0;for(const q of sources){const d=(x-q.x)**2+(y-q.y)**2;value+=q.p*Math.exp(-d*65);}
   const turbulence=Math.sin(x*34+Math.sin(y*19+flow))*Math.cos(y*31-flow*.7)*.24+Math.sin(x*79+y*63+flow)*.08;
   value=(value+turbulence)*(.85+c.intensity*.25);if(value<.16)continue;
   ctx.fillStyle=palette[Math.min(7,Math.floor(value*5))];ctx.fillRect(ix*cell,iy*cell,cell+.5,cell+.5);
  }
  ctx.strokeStyle='#99e9ed';ctx.lineWidth=Math.max(.6,w/800*c.lineWidth);ctx.globalAlpha=c.opacity*.7;
  const box=m*(.28+Math.sin(flow*.4)*.025),cx=w/2+Math.sin(flow*.37)*m*.07,cy=h/2+Math.cos(flow*.29)*m*.05;
  ctx.strokeRect(cx-box,cy-box,box*2,box*2);line(ctx,[[cx,0],[cx,h]]);line(ctx,[[0,cy],[w,cy]]);
  caption(s,'THERMAL / LOCK',cx-box,cy-box-8);
  for(const {note,age} of hits.slice(0,8)){
   const x=w/2+(.22+noise(note.midi*7+note.time)*.56-.5)*m*c.size,y=h/2+(.2+noise(note.midi*11+note.time)*.6-.5)*m*c.size,r=m*.025*(1+note.velocity);
   ctx.globalAlpha=c.opacity*pulse(age,note.duration);ctx.strokeStyle='#fff7ce';ctx.strokeRect(x-r,y-r,r*2,r*2);ctx.fillStyle='#fff7ce';dot(ctx,x,y,m*.004);
   caption(s,noteName(note.midi),x+r+4,y-r);ctx.globalAlpha*=.25;line(ctx,[[cx,cy],[x,y]]);
  }
 },
 'blob-paper':s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s),count=Math.min(70,Math.max(14,Math.floor(c.density/14)));
  ctx.shadowBlur=0;
  for(let j=0;j<count;j++){
   const u=j/(count-1),points:number[][]=[];
   for(let i=0;i<=90;i++){
    const x=w*.14+i/90*w*.72,envelope=Math.sin(i/90*Math.PI);
    const fold=hits.reduce((v,n)=>v+Math.exp(-Math.pow((u-(n.note.midi%24)/24)*9,2))*Math.sin(i*.085-n.age*5)*pulse(n.age,n.note.duration)*n.note.velocity*c.velocity,0);
    const y=h*.5+(u-.5)*m*.48*c.size+envelope*(Math.sin(i*.07+t*c.speed+u*3)*m*.09+fold*m*.1*c.intensity+f[1]*m*.02);points.push([x,y]);
   }
   ctx.strokeStyle=j%7===0?c.secondary:c.accent;ctx.globalAlpha=c.opacity*(j%7===0?.8:.38);ctx.lineWidth=(j%7===0?1.4:.65)*w/720*c.lineWidth;line(ctx,points);
  }
  ctx.globalAlpha=c.opacity;caption(s,'CONTOUR STUDY / '+String(hits.length).padStart(2,'0'),w*.14,h*.8);
 },
 domino:s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s,.8);
  ctx.shadowBlur=0;
  for(let i=0;i<12;i++){
   const hit=hits.filter(n=>n.note.midi%12===i).sort((a,b)=>a.age-b.age)[0],energy=hit?pulse(hit.age,hit.note.duration)*hit.note.velocity*c.velocity:0;
   const x=w*.15+i*w*.065,y=h*.65+Math.sin(i*.5)*m*.05,height=m*(.13+(i%4)*.035)*c.size;
   ctx.save();ctx.translate(x,y);ctx.fillStyle=c.secondary;ctx.globalAlpha=c.opacity*.12;ctx.beginPath();ctx.ellipse(height*.2,7,height*.48,m*.015,0,0,tau);ctx.fill();
   const fall=hit?Math.sin(Math.min(1,hit.age/.22)*Math.PI/2)*energy:Math.sin(t*c.speed+i*.4)*.035*(1+f[0]);ctx.rotate(-fall*.95);
   const width=m*.024*c.size;ctx.globalAlpha=c.opacity;ctx.fillStyle=hit?c.secondary:c.accent;ctx.fillRect(-width/2,-height,width,height);ctx.fillStyle=c.textColor;ctx.globalAlpha=c.opacity*.22;
   ctx.beginPath();ctx.moveTo(width/2,-height);ctx.lineTo(width/2+width*.45,-height-width*.3);ctx.lineTo(width/2+width*.45,-width*.3);ctx.lineTo(width/2,0);ctx.fill();
   ctx.fillStyle=c.background;ctx.globalAlpha=c.opacity*.65;dot(ctx,0,-height*.75,width*.13);dot(ctx,0,-height*.25,width*.13);ctx.restore();
   if(hit)caption(s,noteName(hit.note.midi),x-m*.018,y+m*.05);
  }
 },
 scope:s=>{
  const {ctx,w,h,t,c,wave}=s,m=Math.min(w,h),hits=recent(s,.2);
  ctx.strokeStyle=c.secondary;ctx.globalAlpha=c.opacity*.3;ctx.strokeRect(w*.1,h*.25,w*.8,h*.5);
  for(let trail=5;trail>=0;trail--){
   ctx.strokeStyle=trail?c.secondary:c.accent;ctx.globalAlpha=c.opacity*(trail?.06:.95);ctx.lineWidth=(trail?2:1.2)*w/720*c.lineWidth;
   line(ctx,Array.from({length:160},(_,i)=>{const u=i/159,v=wave[Math.min(63,Math.floor(u*63))];const harmonic=hits.reduce((v,n)=>v+Math.sin(u*tau*(2+(n.note.midi%24)/2)-t*c.speed*3)*pulse(n.age,n.note.duration)*n.note.velocity*c.velocity,0);return [w*.1+u*w*.8,h*.5+(v*.28+harmonic*.055)*m*c.size*c.intensity+trail*2];}));
  }
  ctx.globalAlpha=c.opacity;caption(s,'PHOSPHOR / '+(hits[0]?noteName(hits[0].note.midi):'SIGNAL'),w*.1,h*.8);
 },
 transit:s=>{
  const {ctx,w,h,t,c,layers}=s,m=Math.min(w,h),tracks=layers.filter(l=>l.enabled),hits=recent(s,.3);ctx.shadowBlur=0;
  for(let row=0;row<(tracks.length||3);row++){
   const layer=tracks[row],local=layer?(t-layer.offset):t,period=layer?.repeat?layer.length:0,clock=period?((local%period)+period)%period:local;
   const notes=layer?.notes||Array.from({length:12},(_,i)=>({time:i*.5,midi:48+(i*7+row*3)%24,duration:.3,velocity:.7,id:''}));
   const visible=notes.filter(n=>Math.abs(n.time-clock)<6).slice(0,100),color=layer?.color||(row%2?c.secondary:c.accent);
   ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=c.opacity*.55;ctx.lineWidth=m*.006*c.lineWidth;
   const points=visible.map(n=>[w*.4+(n.time-clock)*w/9,h*.5+(row-((tracks.length||3)-1)/2)*h*.17+(n.midi%12-6)*m*.006*c.size]);line(ctx,points);
   visible.forEach((n,i)=>{const [x,y]=points[i],on=local>=0&&clock>=n.time&&clock<n.time+n.duration;ctx.globalAlpha=c.opacity;ctx.fillStyle=c.background;dot(ctx,x,y,m*.009);ctx.strokeStyle=color;ctx.beginPath();ctx.arc(x,y,m*.009,0,tau);ctx.stroke();if(on){ctx.fillStyle=color;dot(ctx,x,y,m*.016*(1+n.velocity*c.velocity));caption(s,noteName(n.midi),x+10,y-12);}});
   const active=hits.find(n=>n.layer.id===layer?.id);if(active){ctx.fillStyle=color;ctx.globalAlpha=c.opacity;const y=h*.5+(row-((tracks.length||3)-1)/2)*h*.17+(active.note.midi%12-6)*m*.006*c.size;ctx.fillRect(w*.4-m*.023,y-m*.012,m*.046,m*.024);}
  }
  ctx.globalAlpha=c.opacity;caption(s,'TRANSIT / LIVE ROUTES',w*.1,h*.83);
 },
 'piano-roll':s=>{
  const {ctx,w,h,t,c,layers,notes}=s,m=Math.min(w,h),left=w*.15,bottom=h*.8;
  ctx.shadowBlur=0;for(let pitch=36;pitch<85;pitch++){ctx.strokeStyle=c.secondary;ctx.globalAlpha=c.opacity*(pitch%12===0?.22:.055);const y=bottom-(pitch-36)/48*h*.57;line(ctx,[[left,y],[w*.9,y]]);}
  for(const l of layers.filter(l=>l.enabled)){
   let local=t-l.offset;if(local<0)continue;if(l.repeat&&l.length)local%=l.length;
   for(const n of l.notes){const x=w*.35+(n.time-local)*w/9,y=bottom-(n.midi-36)/48*h*.57,width=Math.max(3,n.duration*w/9*c.noteScale);if(x>w*.9||x+width<left)continue;
    const active=local>=n.time&&local<n.time+n.duration;ctx.fillStyle=l.color;ctx.globalAlpha=c.opacity*(active?1:.35+n.velocity*.3);ctx.shadowColor=l.color;ctx.shadowBlur=active?c.glow+8:0;ctx.fillRect(Math.max(left,x),y,Math.min(width,w*.9-x),Math.max(3,m*.009*c.size));if(active)caption(s,noteName(n.midi),w*.35+8,y-6);
   }
  }
  ctx.shadowBlur=c.glow;ctx.strokeStyle=c.accent;ctx.globalAlpha=c.opacity;line(ctx,[[w*.35,h*.2],[w*.35,h*.83]]);
  if(c.keyboard)for(let i=0;i<24;i++){const on=notes.some(n=>n.note.midi%24===i);ctx.fillStyle=on?c.accent:[1,3,6,8,10].includes(i%12)?c.secondary:c.textColor;ctx.globalAlpha=c.opacity*(on?1:.3);ctx.fillRect(left+i*w*.75/24,h*.85,w*.75/24-2,on?m*.045:m*.03);}
 },
 spectrum:s=>{
  const {ctx,w,h,c,spectrum,t}=s,m=Math.min(w,h),hits=recent(s,.25);ctx.shadowBlur=c.glow;
  for(let i=0;i<64;i++){
   const boost=hits.reduce((v,n)=>v+Math.exp(-Math.pow((i-(n.note.midi-24)*64/84)/2,2))*pulse(n.age,n.note.duration)*n.note.velocity*c.velocity,0),v=Math.min(1,spectrum[i]*c.intensity+boost*.6)*c.size;
   ctx.fillStyle=boost>.1?c.secondary:c.accent;ctx.strokeStyle=ctx.fillStyle;ctx.globalAlpha=c.opacity;
   if(c.circular){const a=i/64*tau+t*.08*c.speed,r=m*.18;ctx.lineWidth=m*.006*c.lineWidth;line(ctx,[[w/2+Math.cos(a)*r,h/2+Math.sin(a)*r],[w/2+Math.cos(a)*(r+v*m*.25),h/2+Math.sin(a)*(r+v*m*.25)]]);}
   else{const x=w*.1+i*w*.8/64,bh=v*m*.42;ctx.fillRect(x,h*.65-bh,w*.8/64*.65,Math.max(2,bh));ctx.globalAlpha=c.opacity*.14;ctx.fillRect(x,h*.66,w*.8/64*.65,bh*.3);ctx.globalAlpha=c.opacity*.65;ctx.fillRect(x,h*.65-bh-m*.015,w*.8/64*.65,2);}
  }
 },
 particles:s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s,1.4);ctx.shadowBlur=c.glow;
  for(let i=0;i<c.density;i++){const x=noise(i)*w,y=(noise(i+9)*h-t*c.speed*m*.012+h*100)%h;ctx.globalAlpha=c.opacity*(.08+noise(i+3)*.2);ctx.fillStyle=c.secondary;dot(ctx,x,y,.5+noise(i+8)*m*.002);}
  for(const {note,age,layer} of hits){const life=Math.min(1,age/(note.duration+1.4)),fade=(1-life)**2,x=w*(.2+(note.midi%24)/24*.6),y=h*(.35+noise(note.midi)*.25),energy=note.velocity*c.velocity*c.intensity;
   ctx.strokeStyle=layer.color;ctx.fillStyle=layer.color;ctx.lineWidth=w/720;
   for(let i=0;i<24;i++){const a=noise(i+note.midi*31)*tau,speed=(.08+noise(i+4)*.18)*m*energy,travel=age*(.7+c.speed*.3),px=x+Math.cos(a)*speed*travel,py=y+Math.sin(a)*speed*travel+age*age*m*.045;
    ctx.globalAlpha=c.opacity*fade;line(ctx,[[px-Math.cos(a)*m*.025*c.trails,py-Math.sin(a)*m*.025*c.trails],[px,py]]);dot(ctx,px,py,(1.5+noise(i)*3)*w/540);
   }
  }
  if(!hits.length){ctx.globalAlpha=c.opacity*.3;ctx.fillStyle=c.accent;dot(ctx,w/2,h/2,m*.01*(1+f[0]));}
 },
 orbit:s=>{
  const {ctx,w,h,t,c,f}=s,m=Math.min(w,h),hits=recent(s,.8);ctx.save();ctx.translate(w/2,h/2);ctx.rotate(-.3);
  for(let i=0;i<7;i++){
   const hit=hits.find(n=>n.note.midi%7===i),energy=hit?pulse(hit.age,hit.note.duration)*hit.note.velocity*c.velocity:0,r=m*(.095+i*.038)*c.size,a=t*c.speed*(.2+i*.035)+i*2.4;
   ctx.strokeStyle=c.secondary;ctx.globalAlpha=c.opacity*(.12+energy*.35);ctx.lineWidth=w/720*c.lineWidth;ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,0,tau);ctx.stroke();
   ctx.strokeStyle=hit?.layer.color||c.accent;ctx.globalAlpha=c.opacity*(.3+energy*.7);ctx.lineWidth=(1+energy*3)*w/720;ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,a-.5-c.trails,a);ctx.stroke();
   const x=Math.cos(a)*r,y=Math.sin(a)*r*.55;ctx.fillStyle=ctx.strokeStyle;ctx.globalAlpha=c.opacity;dot(ctx,x,y,m*(.004+energy*.009));if(hit)caption(s,noteName(hit.note.midi),x+8,y-8);
  }
  ctx.fillStyle=c.accent;ctx.globalAlpha=c.opacity;ctx.shadowColor=c.accent;ctx.shadowBlur=c.glow+12;dot(ctx,0,0,m*(.025+f[0]*.01));ctx.restore();
 }
};
export function renderFrame(ctx:Ctx,w:number,h:number,time:number,c:Config,layers:MidiLayer[],features?:Features){
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle=c.background;ctx.fillRect(0,0,w,h);
 const index=features?Math.min(features.rms.length-1,Math.max(0,Math.floor(time*features.rate))):0;
 const sample=(a:Float32Array|undefined)=>{if(!a)return .2+.15*Math.sin(time*3);const back=Math.floor(c.smoothing*12);let v=0;for(let i=0;i<=back;i++)v+=a[Math.max(0,index-i)]||0;return v/(back+1);};
 const f=[sample(features?.bass)*c.bass,sample(features?.mid)*c.mid,sample(features?.high)*c.treble,sample(features?.rms),sample(features?.onsets)*c.transient];
 const spectrum=Array.from({length:64},(_,i)=>features?features.spectrum[index*64+i]||0:.2+Math.sin(i*.3+time)*.1),wave=Array.from({length:64},(_,i)=>features?features.wave[index*64+i]||0:Math.sin(i*.25+time*2)*.3);
 if(c.grid){ctx.strokeStyle=c.textColor;ctx.globalAlpha=.09;ctx.lineWidth=1;for(let x=0;x<w;x+=w/16)line(ctx,[[x,0],[x,h]]);for(let y=0;y<h;y+=h/24)line(ctx,[[0,y],[w,y]]);}
 artDirection(ctx,w,h,time,c,layers,false);
 const [bx,by,bw,bh]=directions[c.preset].box;
 ctx.save();ctx.beginPath();ctx.rect(bx*w,by*h,bw*w,bh*h);ctx.clip();ctx.translate(bx*w,by*h);
 const sw=bw*w,sh=bh*h,scale=c.layout==='Hero'?1.16:c.layout==='Minimal'?.84:1;
 ctx.translate(sw/2,sh/2);ctx.scale(scale,scale);ctx.translate(-sw/2,-sh/2);
 ctx.globalAlpha=c.opacity;ctx.lineWidth=c.lineWidth*w/720;ctx.shadowBlur=c.glow*w/720;ctx.shadowColor=c.accent;ctx.filter=c.blur?`blur(${c.blur*w/720}px)`:'none';
 const scene={ctx,w:sw,h:sh,t:time,c,f,spectrum,wave,notes:activeNotes(layers,time),layers};renderers[c.preset](scene);ctx.restore();ctx.restore();
 artDirection(ctx,w,h,time,c,layers,true);
 if(c.safe){ctx.save();ctx.strokeStyle=c.secondary;ctx.setLineDash([8,8]);ctx.strokeRect(w*.08,h*.1,w*.84,h*.8);ctx.restore();}

}
