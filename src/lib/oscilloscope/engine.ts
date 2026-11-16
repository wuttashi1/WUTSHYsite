import {paintBeam,phosphors} from './beam';
export const scopePresets=Object.fromEntries(Object.entries(phosphors).map(([id,p])=>[id,{name:p.name,description:p.description,ink:`rgb(${p.color.map(v=>Math.round(v*255)).join(',')})`,background:'#030806'}])) as Record<keyof typeof phosphors,{name:string;description:string;ink:string;background:string}>;
export type ScopePreset=keyof typeof scopePresets;
export interface ScopeConfig{preset:ScopePreset;mode:'xy'|'wave';gain:number;rotation:number;offsetX:number;offsetY:number;windowMs:number;intensity:number;focus:number;persistence:number;upsample:1|2|4;grid:boolean;swap:boolean;invertY:boolean;channels:'xy'|'xyz'|'xyzrgb';}
export const scopeDefaults:ScopeConfig={preset:'emerald',mode:'xy',gain:1,rotation:0,offsetX:0,offsetY:0,windowMs:30,intensity:1,focus:1,persistence:.65,upsample:2,grid:false,swap:false,invertY:false,channels:'xy'};
export interface Signal{channels:Float32Array[];sampleRate:number;duration:number;}
export function sampleAt(a:Float32Array,time:number,sr:number){const pos=time*sr,i=Math.floor(pos);if(i<0||i>=a.length)return 0;const f=pos-i;return a[i]*(1-f)+(a[i+1]??a[i])*f;}
export function validScope(v:unknown):v is ScopeConfig{if(!v||typeof v!=='object')return false;const c=v as ScopeConfig;return Object.hasOwn(scopePresets,c.preset)&&['xy','wave'].includes(c.mode)&&['xy','xyz','xyzrgb'].includes(c.channels)&&[1,2,4].includes(c.upsample)&&Object.entries({gain:[0,5],rotation:[-180,180],offsetX:[-1,1],offsetY:[-1,1],windowMs:[2,100],intensity:[.1,3],focus:[.3,4],persistence:[0,1]}).every(([key,[lo,hi]])=>{const n=c[key as keyof ScopeConfig];return typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi;})&&['grid','swap','invertY'].every(k=>typeof c[k as keyof ScopeConfig]==='boolean');}
export function renderScope(ctx:CanvasRenderingContext2D,w:number,h:number,time:number,c:ScopeConfig,signal:Signal,title='STEREO SIGNAL'){
 const p=phosphors[c.preset],m=Math.min(w,h),rim=m*p.frame,x=rim,y=rim,bw=w-rim*2,bh=h-rim*2;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.fillStyle='#060707';ctx.fillRect(0,0,w,h);
 // Close-up tube: dark rubber bezel with a shallow polished glass edge.
 const frame=ctx.createLinearGradient(0,0,w,h);frame.addColorStop(0,'#272b28');frame.addColorStop(.15,'#0b0d0c');frame.addColorStop(.7,'#030404');frame.addColorStop(1,'#212420');ctx.fillStyle=frame;ctx.beginPath();ctx.roundRect(m*.008,m*.008,w-m*.016,h-m*.016,m*.024);ctx.fill();
 ctx.save();ctx.beginPath();ctx.roundRect(x,y,bw,bh,m*(c.preset==='ice'?.09:.028));ctx.clip();ctx.fillStyle='#010502';ctx.fillRect(x,y,bw,bh);
 const backend=paintBeam(ctx,Math.round(m),c,signal,time,x,y,bw,bh);
 if(c.grid){ctx.globalAlpha=.22;ctx.strokeStyle='#314a37';ctx.lineWidth=m/1200;for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(x+i*bw/10,y);ctx.lineTo(x+i*bw/10,y+bh);ctx.moveTo(x,y+i*bh/10);ctx.lineTo(x+bw,y+i*bh/10);ctx.stroke();}ctx.globalAlpha=1;}
 const vignette=ctx.createRadialGradient(w/2,h/2,m*.2,w/2,h/2,m*.67);vignette.addColorStop(0,'#00000000');vignette.addColorStop(.65,'#00000009');vignette.addColorStop(1,'#000000a0');ctx.fillStyle=vignette;ctx.fillRect(x,y,bw,bh);
 if(c.preset==='ice'||c.preset==='paper'){const reflection=ctx.createLinearGradient(x,y,x+bw,y+bh);reflection.addColorStop(0,'#d9f9f009');reflection.addColorStop(.3,'#d9f9f003');reflection.addColorStop(.7,'#00000000');ctx.fillStyle=reflection;ctx.fillRect(x,y,bw,bh);}
 ctx.restore();ctx.strokeStyle='#7e95821a';ctx.lineWidth=m*.002;ctx.beginPath();ctx.roundRect(x,y,bw,bh,m*(c.preset==='ice'?.09:.028));ctx.stroke();
 if(c.preset==='ice'){for(let i=0;i<1200;i++){ctx.fillStyle=i%2?'#ffffff06':'#00000030';const px=((i*137.31)%997)/997*w,py=((i*73.91)%991)/991*h;if(px<x||px>x+bw||py<y||py>y+bh)ctx.fillRect(px,py,m*.003,m*.002);}}
 ctx.restore();void title;return backend;
}
export type DemoKind='ribbon'|'rosette'|'orbit';
export function demoSignal(kind:DemoKind='ribbon'):Signal{const sampleRate=48000,duration=8,channels=[new Float32Array(sampleRate*duration),new Float32Array(sampleRate*duration)];for(let i=0;i<channels[0].length;i++){const t=i/sampleRate,a=t*2*Math.PI*55;let x:number,y:number;
 if(kind==='ribbon'){const r=.55+.17*Math.sin(a*7+t*.8);x=r*Math.cos(a)+.12*Math.cos(a*11);y=r*Math.sin(a+.25*Math.sin(t*.7))+.12*Math.sin(a*11);const angle=t*.45,xx=x*Math.cos(angle)-y*Math.sin(angle);y=x*Math.sin(angle)+y*Math.cos(angle);x=xx;}
 else if(kind==='rosette'){const r=.48+.22*Math.cos(a*8+t*.65);x=r*Math.cos(a);y=r*Math.sin(a);}
 else{const r=.55+.1*Math.sin(a*5);x=r*Math.cos(a);y=r*Math.sin(a)*Math.cos(t*.7)+.18*Math.sin(a*3+t);}
 channels[0][i]=x;channels[1][i]=y;}return {channels,sampleRate,duration};}
