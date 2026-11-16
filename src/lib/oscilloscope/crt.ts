import type {ScopeConfig} from './engine';
type Ctx=CanvasRenderingContext2D;
export const tubes={
 emerald:{case:'#4d5145',light:'#929580',ink:'#a7ff8a',screen:'#0e2319',round:true,name:'P31 / GREEN PHOSPHOR'},
 amber:{case:'#514436',light:'#a9977b',ink:'#ffcc72',screen:'#22170c',round:false,name:'P7 / AMBER STORAGE'},
 ice:{case:'#37454b',light:'#899da3',ink:'#b1eeff',screen:'#10212b',round:false,name:'P11 / BLUE LABORATORY'},
 ruby:{case:'#38333c',light:'#817789',ink:'#ff91c9',screen:'#241020',round:false,name:'VECTOR / STUDIO MONITOR'},
 paper:{case:'#6a675c',light:'#bab8a6',ink:'#e9f5e5',screen:'#19201a',round:false,name:'P4 / MONOCHROME TV'}
};
export function screenPath(ctx:Ctx,c:ScopeConfig,x:number,y:number,w:number,h:number){ctx.beginPath();if(tubes[c.preset].round)ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);else ctx.roundRect(x,y,w,h,[w*.12,w*.12,w*.12,w*.12]);}
export function cabinet(ctx:Ctx,w:number,h:number,c:ScopeConfig){
 const t=tubes[c.preset],m=Math.min(w,h),x=w*.1,y=h*.16,bw=w*.8,bh=h*.61;
 ctx.fillStyle='#080a0b';ctx.fillRect(0,0,w,h);
 const ambient=ctx.createRadialGradient(w*.5,h*.45,0,w*.5,h*.45,w*.7);ambient.addColorStop(0,'#333a37');ambient.addColorStop(1,'#080a0b');ctx.fillStyle=ambient;ctx.fillRect(0,0,w,h);
 ctx.shadowColor='#000';ctx.shadowBlur=m*.05;ctx.shadowOffsetY=m*.026;
 const body=ctx.createLinearGradient(0,h*.03,w,h);body.addColorStop(0,t.light);body.addColorStop(.025,t.case);body.addColorStop(.6,t.case);body.addColorStop(1,'#171a18');ctx.fillStyle=body;ctx.beginPath();ctx.roundRect(w*.025,h*.025,w*.95,h*.94,m*.035);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.strokeStyle='#ffffff26';ctx.lineWidth=m*.001;ctx.stroke();
 // Deterministic cast-metal grain, not animated digital noise.
 for(let i=0;i<2200;i++){const px=((i*173.137)%997)/997*w,py=((i*71.713)%991)/991*h;if(px<w*.035||px>w*.965||py<h*.035||py>h*.95)continue;ctx.fillStyle=i%2?'#ffffff08':'#00000013';ctx.fillRect(px,py,m*.0015,m*.0015);}
 ctx.fillStyle='#d9ddce';ctx.font=`600 ${m*.019}px monospace`;ctx.fillText('WUTSHY',w*.075,h*.086);ctx.font=`${m*.011}px monospace`;ctx.fillText(t.name,w*.33,h*.085);ctx.fillStyle='#a9d58d';ctx.shadowColor='#acff87';ctx.shadowBlur=m*.009;ctx.beginPath();ctx.arc(w*.907,h*.081,m*.004,0,7);ctx.fill();ctx.shadowBlur=0;
 for(let i=0;i<30;i++){ctx.fillStyle='#121611';ctx.fillRect(w*(.2+i*.02),h*.111,w*.011,h*.008);ctx.fillStyle='#ffffff12';ctx.fillRect(w*(.2+i*.02),h*.119,w*.011,h*.001);}
 // Four concentric bevels give the tube a deeply recessed rubber surround.
 for(let i=4;i>=0;i--){const d=m*(.005+i*.005);screenPath(ctx,c,x-d,y-d,bw+d*2,bh+d*2);ctx.fillStyle=['#060a08','#111613','#252c25','#070a08',t.light][i];ctx.fill();}
 const fill=ctx.createRadialGradient(w*.47,h*.4,0,w*.5,h*.46,w*.5);fill.addColorStop(0,t.screen);fill.addColorStop(.75,'#09110d');fill.addColorStop(1,'#010403');screenPath(ctx,c,x,y,bw,bh);ctx.fillStyle=fill;ctx.fill();
 // Knurled controls and engraved panel legends.
 ['INTENSITY','FOCUS','TIME / DIV'].forEach((label,i)=>{const px=w*(.48+i*.17),py=h*.875,r=m*.034;ctx.fillStyle='#c6c9ba';ctx.font=`${m*.009}px monospace`;ctx.textAlign='center';ctx.fillText(label,px,py-r-m*.018);ctx.strokeStyle='#b0b3a180';ctx.lineWidth=m*.001;for(let k=0;k<13;k++){const a=2.35+k/12*4.7;ctx.beginPath();ctx.moveTo(px+Math.cos(a)*r*1.25,py+Math.sin(a)*r*1.25);ctx.lineTo(px+Math.cos(a)*r*1.4,py+Math.sin(a)*r*1.4);ctx.stroke();}const g=ctx.createLinearGradient(px-r,py-r,px+r,py+r);g.addColorStop(0,'#686b61');g.addColorStop(.45,'#292d28');g.addColorStop(1,'#060907');ctx.shadowColor='#000';ctx.shadowBlur=r*.3;ctx.shadowOffsetY=r*.18;ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;for(let k=0;k<32;k++){const a=k/32*Math.PI*2;ctx.strokeStyle=k%2?'#111810':'#a4aa9540';ctx.beginPath();ctx.moveTo(px+Math.cos(a)*r*.82,py+Math.sin(a)*r*.82);ctx.lineTo(px+Math.cos(a)*r*.96,py+Math.sin(a)*r*.96);ctx.stroke();}const a=-2.3+(i===0?c.intensity/3:i===1?c.focus/4:c.windowMs/100)*4.6;ctx.strokeStyle='#e2e5d5';ctx.lineWidth=m*.0025;ctx.beginPath();ctx.moveTo(px+Math.sin(a)*r*.35,py-Math.cos(a)*r*.35);ctx.lineTo(px+Math.sin(a)*r*.72,py-Math.cos(a)*r*.72);ctx.stroke();});ctx.textAlign='left';
 ctx.fillStyle='#babfb0';ctx.font=`${m*.012}px monospace`;ctx.fillText('X — Y',w*.085,h*.843);for(let i=0;i<2;i++){const px=w*(.115+i*.085),py=h*.886;ctx.fillStyle='#999c89';ctx.beginPath();ctx.arc(px,py,m*.019,0,7);ctx.fill();ctx.fillStyle='#161b15';ctx.beginPath();ctx.arc(px,py,m*.013,0,7);ctx.fill();ctx.fillStyle='#b29b64';ctx.beginPath();ctx.arc(px,py,m*.004,0,7);ctx.fill();}
 for(const px of [.053,.947])for(const py of [.055,.936]){const g=ctx.createLinearGradient(w*px-5,h*py-5,w*px+5,h*py+5);g.addColorStop(0,'#929887');g.addColorStop(1,'#141a14');ctx.fillStyle=g;ctx.beginPath();ctx.arc(w*px,h*py,m*.007,0,7);ctx.fill();ctx.strokeStyle='#171b15';ctx.lineWidth=m*.002;ctx.beginPath();ctx.moveTo(w*px-m*.004,h*py-m*.002);ctx.lineTo(w*px+m*.004,h*py+m*.002);ctx.stroke();}
 return {x,y,bw,bh};
}
export function glass(ctx:Ctx,w:number,h:number,c:ScopeConfig,x:number,y:number,bw:number,bh:number){
 ctx.save();screenPath(ctx,c,x,y,bw,bh);ctx.clip();
 const vignette=ctx.createRadialGradient(w*.5,y+bh*.48,bw*.18,w*.5,y+bh*.5,bw*.58);vignette.addColorStop(0,'#00000000');vignette.addColorStop(.7,'#00000015');vignette.addColorStop(1,'#000000c0');ctx.fillStyle=vignette;ctx.fillRect(x,y,bw,bh);
 const reflection=ctx.createLinearGradient(x,y,x+bw*.45,y+bh);reflection.addColorStop(0,'#edf8e521');reflection.addColorStop(.32,'#edf8e508');reflection.addColorStop(.5,'#ffffff00');reflection.addColorStop(1,'#ffffff00');ctx.fillStyle=reflection;ctx.beginPath();ctx.ellipse(x+bw*.28,y+bh*.13,bw*.52,bh*.28,-.25,0,7);ctx.fill();
 ctx.strokeStyle='#d7ead914';ctx.lineWidth=w*.0015;ctx.beginPath();ctx.ellipse(x+bw*.5,y+bh*.47,bw*.475,bh*.455,0,Math.PI*1.08,Math.PI*1.75);ctx.stroke();
 // Subtle phosphor mask, visible only at full resolution.
 ctx.fillStyle='#0000000b';for(let yy=y;yy<y+bh;yy+=3)ctx.fillRect(x,yy,bw,.65);
 ctx.restore();
}
