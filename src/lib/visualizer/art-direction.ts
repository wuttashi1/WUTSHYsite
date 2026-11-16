import type {Config,PresetId,MidiLayer} from './types';
import {noteName,activeNotes} from './midi';
type Ctx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
export interface Direction {name:string;category:string;box:[number,number,number,number];font:'serif'|'sans-serif'|'monospace';title:[number,number,number];}
export const directions:Record<PresetId,Direction>={
 'blob-mono':{name:'Specimen 01',category:'MICROSCOPY',box:[.06,.2,.88,.59],font:'monospace',title:[.08,.15,.062]},
 'blob-thermal':{name:'Heat Evidence',category:'THERMOGRAPHIC ARCHIVE',box:[0,.15,1,.7],font:'monospace',title:[.06,.12,.052]},
 'blob-paper':{name:'Contour Edition',category:'PRINT STUDY',box:[.08,.24,.84,.52],font:'serif',title:[.08,.19,.12]},
 domino:{name:'Play / Pause',category:'KINETIC TOYS',box:[.02,.24,.96,.52],font:'sans-serif',title:[.08,.2,.11]},
 scope:{name:'Signal Dept.',category:'ANALOGUE INSTRUMENTS',box:[.04,.2,.92,.59],font:'monospace',title:[.08,.15,.073]},
 transit:{name:'Night Service',category:'SONIC TRANSIT AUTHORITY',box:[.04,.24,.92,.48],font:'sans-serif',title:[.08,.17,.087]},
 'piano-roll':{name:'Sequence Index',category:'PERFORMANCE ARCHIVE',box:[.04,.19,.92,.62],font:'monospace',title:[.07,.15,.063]},
 spectrum:{name:'Frequency Club',category:'LIVE FREQUENCY POSTER',box:[.03,.3,.94,.43],font:'sans-serif',title:[.08,.2,.13]},
 particles:{name:'Afterglow',category:'LONG EXPOSURE',box:[0,.13,1,.68],font:'serif',title:[.07,.84,.14]},
 orbit:{name:'Orrery No. 07',category:'CELESTIAL MECHANICS',box:[.1,.24,.8,.5],font:'serif',title:[.08,.18,.094]},
 aurora:{name:'Polar Broadcast',category:'NIGHT TRANSMISSION',box:[.04,.29,.92,.39],font:'sans-serif',title:[.07,.22,.125]},
 eclipse:{name:'TOTALITY',category:'ASTRONOMICAL BULLETIN',box:[.15,.22,.7,.47],font:'serif',title:[.08,.17,.13]},
 prism:{name:'Chromatic Lab',category:'OPTICAL RESEARCH',box:[.04,.29,.92,.43],font:'monospace',title:[.07,.22,.079]},
 ocean:{name:'Marine Radio',category:'MIDNIGHT FREQUENCY',box:[.04,.32,.92,.4],font:'sans-serif',title:[.07,.24,.12]},
 dunes:{name:'Field Notes',category:'DESERT SOUND EXPEDITION',box:[.13,.25,.74,.45],font:'serif',title:[.08,.18,.14]},
 vortex:{name:'Rewind / 90',category:'MAGNETIC TAPE',box:[.08,.31,.43,.29],font:'sans-serif',title:[.08,.19,.115]},
 bloom:{name:'Flora Sonora',category:'BOTANICAL SOUND STUDY',box:[.16,.23,.68,.49],font:'serif',title:[.08,.17,.125]},
 constellation:{name:'Star Atlas',category:'OBSERVATION PLATE',box:[.08,.2,.84,.59],font:'serif',title:[.08,.15,.11]},
 ribbons:{name:'Ribbon No. 04',category:'MOTION COUTURE',box:[.24,.15,.7,.63],font:'serif',title:[.08,.87,.12]},
 monolith:{name:'Concrete Studies',category:'ARCHITECTURAL MODEL',box:[.08,.25,.84,.47],font:'sans-serif',title:[.07,.19,.087]},
 rain:{name:'Last Train',category:'WINDOW / 02:17',box:[.15,.24,.7,.52],font:'serif',title:[.08,.18,.13]},
 kaleido:{name:'Rosette Press',category:'ORNAMENT EDITION',box:[.13,.22,.74,.5],font:'serif',title:[.08,.17,.105]},
 vinyl:{name:'Side A',category:'WUTSHY RECORDS',box:[.05,.23,.9,.55],font:'sans-serif',title:[.08,.19,.16]},
 topography:{name:'Sound Survey',category:'CARTOGRAPHIC DEPARTMENT',box:[.06,.21,.88,.58],font:'monospace',title:[.07,.16,.078]},
 city:{name:'Afterhours',category:'CITY OF FREQUENCIES',box:[.08,.2,.84,.58],font:'sans-serif',title:[.07,.16,.11]},
 portal:{name:'Admit One',category:'THE INFINITE CINEMA',box:[.17,.28,.66,.43],font:'sans-serif',title:[.08,.19,.14]},
 ink:{name:'One Breath',category:'INK ON PAPER',box:[.04,.22,.82,.51],font:'serif',title:[.07,.16,.12]},
 helix:{name:'Sequence / DNA',category:'MOLECULAR MUSIC',box:[.07,.23,.53,.57],font:'monospace',title:[.07,.17,.076]},
 radar:{name:'Echo Station',category:'PASSIVE LISTENING',box:[.1,.24,.8,.5],font:'monospace',title:[.07,.17,.087]},
 chroma:{name:'Warp & Weft',category:'TEXTILE RESEARCH',box:[.16,.22,.68,.5],font:'serif',title:[.08,.17,.13]},
 ladder:{name:'Level Report',category:'AUDIO MEASUREMENT',box:[.08,.19,.84,.64],font:'monospace',title:[.07,.15,.072]},
 sheet:{name:'Nocturne',category:'A MIDI MANUSCRIPT',box:[.04,.2,.92,.66],font:'serif',title:[.07,.16,.14]},
 receipt:{name:'Sound Purchase',category:'RECEIPT / ORIGINAL',box:[.04,.04,.92,.92],font:'monospace',title:[.08,.11,.055]},
 rack:{name:'Rack / 003',category:'MODULAR ANALYSIS',box:[.03,.19,.94,.67],font:'monospace',title:[.07,.14,.082]},
 screen:{name:'Chromatic Punch',category:'WOVEN NOTE CARD',box:[.09,.2,.82,.62],font:'sans-serif',title:[.07,.15,.085]},
 strip:{name:'Piano Studies',category:'NO. 01 / STRIP SCORE',box:[.08,.24,.84,.52],font:'serif',title:[.07,.19,.11]},
 'mono-studio':{name:'Cut / Splice',category:'MINIMAL SEQUENCE',box:[.1,.23,.8,.54],font:'sans-serif',title:[.07,.17,.13]},
 'rage-field':{name:'RAGE // LIVE',category:'UNDerground SESSION',box:[.07,.19,.86,.61],font:'sans-serif',title:[.07,.15,.093]},
 'rage-night':{name:'Night OS',category:'LATE SESSION / DESKTOP',box:[.02,.14,.96,.71],font:'monospace',title:[.07,.12,.078]},
 'trap-phosphor':{name:'Green Terminal',category:'PHOSPHOR MEMORY',box:[.05,.15,.9,.7],font:'monospace',title:[.07,.12,.065]},
 'pocket-player':{name:'Pocket Mixtape',category:'PORTABLE SOUND OBJECT',box:[.02,.22,.96,.55],font:'sans-serif',title:[.07,.18,.11]},
 'desktop-player':{name:'Sunday Desktop',category:'PERSONAL SOUND LIBRARY',box:[.02,.16,.96,.66],font:'serif',title:[.07,.14,.089]},
 'tall-studio':{name:'Track Notebook',category:'ARRANGEMENT JOURNAL',box:[.03,.15,.94,.71],font:'monospace',title:[.07,.12,.071]},
 blueprint:{name:'Score Blueprint',category:'ENGINEERING THE MELODY',box:[.06,.19,.88,.65],font:'monospace',title:[.07,.15,.073]},
 'brushed-dots':{name:'Music Box',category:'PERFORATED STEEL SCORE',box:[.09,.2,.82,.6],font:'serif',title:[.07,.16,.13]}
};
export function artDirection(ctx:Ctx,w:number,h:number,t:number,c:Config,layers:MidiLayer[],front:boolean){
 const d=directions[c.preset],unit=Math.min(w,h),notes=activeNotes(layers,t),active=notes.map(n=>noteName(n.note.midi)).slice(0,5).join(' · '),trackCount=layers.filter(l=>l.enabled).length;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.shadowBlur=0;ctx.globalAlpha=c.opacity;ctx.fillStyle=c.textColor;ctx.strokeStyle=c.secondary;ctx.lineWidth=Math.max(.5,unit/700);
 const rect=(x:number,y:number,a:number,b:number,fill=false)=>fill?ctx.fillRect(x*w,y*h,a*w,b*h):ctx.strokeRect(x*w,y*h,a*w,b*h);
 const rule=(x:number,y:number,a:number,b:number)=>{ctx.beginPath();ctx.moveTo(x*w,y*h);ctx.lineTo(a*w,b*h);ctx.stroke();};
 const label=(str:string,x:number,y:number,size=.022,font='monospace',color=c.textColor)=>{if(!c.labels&&size<.05)return;ctx.fillStyle=color;ctx.font=`${Math.max(7,unit*size)}px ${font}`;ctx.fillText(str,x*w,y*h,w*(1-x-.04));};
 const disk=(x:number,y:number,r:number,fill=false)=>{ctx.beginPath();ctx.arc(x*w,y*h,r*unit,0,Math.PI*2);if(fill)ctx.fill();else ctx.stroke();};
 const ticks=(y:number,count=30)=>{for(let i=0;i<count;i++)rule(.08+i*.84/count,y,.08+i*.84/count,y+(i%5?.006:.014));};
 const screws=()=>{for(const x of [.045,.955])for(const y of [.055,.945]){ctx.strokeStyle=c.secondary;disk(x,y,.005);rule(x-.003,y,x+.003,y);}};
 if(!front){
  // Material and physical structure, independent from the animated scene.
  switch(c.preset){
   case 'vortex':ctx.fillStyle=c.secondary;ctx.globalAlpha=c.opacity*.13;rect(.035,.24,.93,.48,true);ctx.globalAlpha=c.opacity;rect(.035,.24,.93,.48);rect(.08,.29,.84,.35);rect(.22,.66,.56,.04);screws();break;
   case 'prism':case 'monolith':case 'blueprint':ctx.globalAlpha=c.opacity*.08;for(let i=0;i<20;i++){rule(.06,.23+i*.03,.94,.23+i*.03);rule(.06+i*.046,.23,.06+i*.046,.82);}ctx.globalAlpha=c.opacity;break;
   case 'dunes':case 'bloom':case 'topography':case 'sheet':case 'ink':case 'strip':case 'blob-paper':ctx.globalAlpha=c.opacity*.035;ctx.fillStyle=c.textColor;for(let i=0;i<650;i++)rect(((i*137)%997)/997,((i*283)%991)/991,.001,.001,true);ctx.globalAlpha=c.opacity;break;
   case 'rain':rect(.11,.21,.78,.58);rect(.125,.225,.75,.55);rule(.5,.23,.5,.77);rule(.13,.53,.87,.53);break;
   case 'vinyl':ctx.fillStyle=c.secondary;ctx.globalAlpha=c.opacity*.09;rect(.04,.22,.92,.57,true);ctx.globalAlpha=c.opacity;rect(.04,.22,.92,.57);screws();break;
   case 'portal':rect(.08,.235,.84,.53);ctx.setLineDash([unit*.006,unit*.009]);rule(.08,.79,.92,.79);ctx.setLineDash([]);break;
   case 'chroma':for(let i=0;i<35;i++){rule(.16+i*.019,.21,.16+i*.019,.24);rule(.16+i*.019,.7,.16+i*.019,.74);}rect(.14,.2,.72,.54);break;
   case 'radar':case 'scope':case 'rack':rect(.025,.04,.95,.92);screws();break;
   case 'brushed-dots':ctx.globalAlpha=c.opacity*.12;for(let j=0;j<100;j++)rule(.07,.2+j*.006,.93,.2+j*.006);ctx.globalAlpha=c.opacity;rect(.06,.18,.88,.65);break;
   case 'screen':rect(.055,.19,.89,.65);for(let j=0;j<10;j++){ctx.fillStyle=c.secondary;ctx.globalAlpha=c.opacity*.35;rect(.07,.23+j*.052,.012,.016,true);}ctx.globalAlpha=c.opacity;break;
   case 'pocket-player':ctx.globalAlpha=c.opacity*.14;ctx.fillStyle=c.secondary;rect(.17,.74,.66,.035,true);ctx.globalAlpha=c.opacity;break;
   case 'rage-night':case 'desktop-player':ctx.globalAlpha=c.opacity*.06;ctx.fillStyle=c.secondary;rect(.05,.25,.9,.59,true);ctx.globalAlpha=c.opacity;break;
   default:break;
  }
  ctx.restore();return;
 }
 // Every edition uses a different editorial hierarchy; the user's title remains prominent.
 if(c.preset!=='receipt'){
  label(d.category.toUpperCase(),.07,.058,.017,'monospace',c.secondary);
  label(c.title&&c.title!=='UNTITLED'?c.title:d.name,d.title[0],d.title[1],d.title[2]*c.textSize/22,d.font);
 }
 switch(c.preset){
  case 'aurora':label('POLAR / LIVE SIGNAL',.07,.27,.024,'monospace',c.accent);ticks(.73);label('TRANSMISSION '+t.toFixed(2)+' s',.08,.79);label(active||'WAITING FOR SIGNAL',.08,.83,.026);break;
  case 'eclipse':for(let i=0;i<5;i++){disk(.18+i*.16,.77,.025);ctx.fillStyle=c.background;disk(.17+i*.16,.765,.023,true);}label('I     II     III     IV     V',.12,.84,.025);label(active||'CONTACT / AUDIO',.08,.9);break;
  case 'prism':label('01  INCIDENT',.06,.32,.018);label('02  DISPERSION',.61,.73,.018);rule(.08,.78,.92,.78);label('λ / PITCH CLASSES',.08,.825);for(let i=0;i<12;i++){ctx.globalAlpha=c.opacity*(notes.some(n=>n.note.midi%12===i)?1:.2);ctx.fillStyle=i%2?c.accent:c.secondary;rect(.08+i*.07,.85,.048,.025,true);}ctx.globalAlpha=c.opacity;break;
  case 'ocean':label('RECEIVER / '+c.bpm+' BPM',.07,.29,.024,'monospace',c.accent);rule(.07,.74,.93,.74);ticks(.76);label('CHANNEL '+String(trackCount).padStart(2,'0'),.08,.84,.026);label(active||'OPEN WATER / NO MIDI',.08,.89);break;
  case 'dunes':ctx.save();ctx.translate(w*.93,h*.7);ctx.rotate(-Math.PI/2);label('EXPEDITION / SOUND FIELD',0,0,.022);ctx.restore();rect(.08,.74,.84,.11);label('FIELD RECORDING',.1,.78,.018);label(c.key+' / '+c.bpm+' BPM',.1,.82,.025);break;
  case 'vortex':disk(.73,.455,.13);disk(.73,.455,.044);for(let i=0;i<6;i++){const a=i*Math.PI/3-t;rule(.73+Math.cos(a)*.035,.455+Math.sin(a)*.025,.73+Math.cos(a)*.1,.455+Math.sin(a)*.07);}rule(.47,.41,.64,.39);rule(.48,.51,.63,.53);label('A',.1,.69,.06,'sans-serif');label('TYPE II / '+t.toFixed(1)+' SEC',.09,.81,.03);label(active||'MAGNETIC MEMORY',.09,.86);break;
  case 'bloom':rule(.51,.56,.51,.8);rule(.51,.7,.64,.66);rule(.51,.74,.4,.7);label('FIG. '+String(notes.length+1).padStart(2,'0'),.08,.76,.022);label('SPECIES: '+(active||'SILENCE'),.08,.85);label('A study of harmonic growth',.08,.9,.027,'serif');break;
  case 'constellation':rect(.055,.19,.89,.61);for(let i=0;i<6;i++)label(String(i*4).padStart(2,'0')+'h',.07+i*.15,.82,.014);label('OBSERVED / '+active,.07,.87,.024);break;
  case 'ribbons':ctx.save();ctx.translate(w*.12,h*.7);ctx.rotate(-Math.PI/2);ctx.fillStyle=c.accent;ctx.font=`${unit*.1}px serif`;ctx.fillText('COUTURE',0,0);ctx.restore();label('04 / MOTION TEXTILE',.34,.16,.023);label('PITCH / '+active,.08,.93,.019);break;
  case 'monolith':rule(.1,.74,.9,.74);rule(.1,.73,.1,.75);rule(.9,.73,.9,.75);label('ELEVATION / '+trackCount+' LAYERS',.1,.79);label('01',.1,.9,.13,'sans-serif',c.accent);label(active||'MODEL AT REST',.39,.86,.028);break;
  case 'rain':label('PLATFORM',.14,.87,.022);label('02',.69,.885,.1,'sans-serif');label('NEXT: '+(active||'SILENCE'),.14,.91,.025);break;
  case 'kaleido':for(const x of [.07,.93])for(const y of [.23,.74]){rule(x-.014,y,x+.014,y);rule(x,y-.01,x,y+.01);}label('ORNAMENT / '+String(notes.length).padStart(2,'0'),.08,.81);label('A rotating print edition',.08,.87,.033,'serif');break;
  case 'vinyl':label('A',.1,.31,.065,'sans-serif',c.accent);label('33⅓',.76,.74,.04,'serif');label('NOW CUTTING',.08,.84);label(active||c.key,.08,.9,.038,'serif');break;
  case 'topography':label('N',.88,.26,.035);rule(.89,.27,.89,.36);rule(.88,.29,.89,.27);for(let i=0;i<5;i++){ctx.fillStyle=i%2?c.background:c.textColor;rect(.09+i*.045,.82,.045,.009,true);}label('CONTOUR INTERVAL / MIDI',.08,.88);break;
  case 'city':rect(.08,.77,.84,.12);label('DISTRICT',.1,.8,.016);label('NIGHT '+String(trackCount).padStart(2,'0'),.1,.85,.05,'sans-serif');label(active,.56,.85,.025);break;
  case 'portal':label('ADMIT ONE / NO RE-ENTRY',.13,.27,.016);label('ROW',.12,.835,.018);label('SEAT',.4,.835,.018);label('TIME',.7,.835,.018);label('A',.12,.89,.06);label(String(notes.length+1).padStart(2,'0'),.4,.89,.06);label(t.toFixed(1),.7,.89,.045);break;
  case 'ink':ctx.fillStyle=c.secondary;rect(.82,.27,.055,.15,true);label('一',.825,.33,.04,'serif',c.background);label('音',.825,.39,.04,'serif',c.background);label('one note / one gesture',.1,.85,.032,'serif');break;
  case 'helix':notes.slice(0,6).forEach((n,i)=>{const y=.34+i*.066;label(noteName(n.note.midi),.66,y,.035);label('v '+Math.round(n.note.velocity*127),.66,y+.024,.017);rule(.52,y,.62,y);});label('SEQUENCE LENGTH / '+notes.length,.08,.87);break;
  case 'radar':for(let i=0;i<4;i++){disk(.2+i*.2,.82,.018);rule(.2+i*.2,.82,.2+i*.2+Math.sin(t*.1+i)*.014,.808);}label('ECHO '+active,.08,.9,.027);break;
  case 'chroma':for(let i=0;i<5;i++){ctx.fillStyle=i%2?c.accent:c.secondary;ctx.globalAlpha=c.opacity*(.2+i*.18);rect(.18+i*.13,.8,.08,.035,true);}ctx.globalAlpha=c.opacity;label('WARP '+trackCount+' / WEFT '+notes.length,.18,.89,.025);break;
  case 'blob-mono':label('SPECIMEN / '+active,.08,.84);label('LIVE FIELD · '+t.toFixed(2)+' s',.08,.9);break;
  case 'blob-thermal':ctx.strokeStyle=c.accent;rect(.07,.87,.025,.018,true);label('LIVE / '+t.toFixed(2)+' s',.12,.885);label('TRACKED '+notes.length,.65,.885);break;
  case 'blob-paper':label('01',.08,.82,.12,'serif');label('INK / '+active,.35,.85,.026);break;
  case 'domino':for(let i=0;i<6;i++){ctx.fillStyle=i<notes.length?c.accent:c.secondary;disk(.12+i*.15,.83,.009,true);}label('TAP. HOLD. FALL.',.08,.9,.033,'sans-serif');break;
  case 'scope':label('X / TIME',.08,.83);label('Y / AMPLITUDE',.56,.83);label('INPUT '+active,.08,.9);break;
  case 'transit':ctx.fillStyle=c.accent;rect(.08,.76,.12,.07,true);label('N',.11,.81,.06,'sans-serif',c.background);label('NEXT STOP',.25,.79,.02);label(active||'TERMINUS',.25,.83,.03);break;
  case 'piano-roll':label('TAKE '+String(trackCount).padStart(2,'0'),.08,.87);label(active,.5,.87);break;
  case 'spectrum':label('DOORS OPEN',.08,.79,.02);label(c.bpm+' BPM',.08,.88,.105,'sans-serif',c.accent);break;
  case 'particles':label('EXPOSURE / '+t.toFixed(2)+' s',.08,.9);break;
  case 'orbit':label('PLATE VII',.08,.8,.04,'serif');label('SATELLITES / '+active,.08,.87);break;
  case 'receipt':label('ORIGINAL / WUTSHY',.12,.935,.02,'monospace','#bdbbb0');break;
  case 'sheet':label('PERFORMANCE / '+c.key,.1,.92,.024,'serif');break;
  case 'ladder':label('SIGNAL INSPECTION / '+t.toFixed(2)+' s',.08,.91,.019);break;
  case 'rack':for(let i=0;i<3;i++){disk(.2+i*.3,.9,.013);label(['IN','BUS','OUT'][i],.23+i*.3,.907,.017);}break;
  case 'screen':label('CARD '+String(Math.floor(t)).padStart(4,'0'),.08,.9);break;
  case 'strip':rule(.1,.82,.9,.82);label('PIANO STUDY / '+active,.1,.88,.026,'serif');break;
  case 'mono-studio':label('CUT',.08,.86,.09,'sans-serif');label(t.toFixed(2),.65,.86,.06);break;
  case 'rage-field':ctx.fillStyle=c.accent;rect(.08,.84,.03,.02,true);label('REC / '+active,.14,.86,.03);break;
  case 'rage-night':label('SESSION_'+String(Math.floor(t)).padStart(4,'0'),.08,.9,.026);break;
  case 'trap-phosphor':label('> PLAY '+active,.08,.91,.025,'monospace',c.accent);break;
  case 'pocket-player':label('MIXTAPE / '+c.bpm+' BPM',.13,.84,.03);label('KEEP THIS ONE.',.13,.9,.032,'sans-serif');break;
  case 'desktop-player':label('saved locally / '+trackCount+' tracks',.08,.91,.025,'serif');break;
  case 'tall-studio':label('ARRANGEMENT / '+active,.08,.92,.022);break;
  case 'blueprint':rect(.62,.86,.3,.08);label('REV / '+notes.length,.65,.91,.026);break;
  case 'brushed-dots':for(let i=0;i<9;i++)disk(.1+i*.1,.87,.004,true);label('PUNCH SCORE / '+active,.1,.92,.023);break;
 }
 ctx.restore();
}
