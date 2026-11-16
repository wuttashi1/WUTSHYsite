export const presetIds=['blob-mono','blob-thermal','blob-paper','domino','scope','transit','piano-roll','spectrum','particles','orbit','aurora','eclipse','prism','ocean','dunes','vortex','bloom','constellation','ribbons','monolith','rain','kaleido','vinyl','topography','city','portal','ink','helix','radar','chroma','ladder','sheet','receipt','rack','screen','strip','mono-studio','rage-field','rage-night','trap-phosphor','pocket-player','desktop-player','tall-studio','blueprint','brushed-dots'] as const;
export type PresetId=typeof presetIds[number];
export interface Note{id:string;time:number;duration:number;midi:number;velocity:number;confidence?:number;}
export interface MidiLayer{id:string;name:string;channel:number;instrument:string;notes:Note[];enabled:boolean;color:string;offset:number;repeat:boolean;length:number;}
export interface Features{rate:number;duration:number;wave:Float32Array;rms:Float32Array;bass:Float32Array;mid:Float32Array;high:Float32Array;onsets:Float32Array;spectrum:Float32Array;bpm:number;key:string;confidence:number;}
export interface Config{
 preset:PresetId;background:string;accent:string;secondary:string;textColor:string;font:string;textSize:number;size:number;speed:number;intensity:number;glow:number;blur:number;opacity:number;density:number;lineWidth:number;grid:boolean;safe:boolean;layout:'Balanced'|'Hero'|'Minimal'|'Scene';ratio:'9:16'|'16:9'|'1:1';
 bass:number;mid:number;treble:number;transient:number;smoothing:number;velocity:number;noteScale:number;labels:boolean;keyboard:boolean;circular:boolean;trails:number;title:string;bpm:number;key:string;
}
export const defaults:Config={preset:'blob-mono',background:'#101014',accent:'#e7e8ee',secondary:'#a78bfa',textColor:'#ffffff',font:'monospace',textSize:22,size:1,speed:1,intensity:1,glow:8,blur:0,opacity:1,density:400,lineWidth:1,grid:true,safe:false,layout:'Balanced',ratio:'9:16',bass:1,mid:1,treble:1,transient:1,smoothing:.3,velocity:1,noteScale:1,labels:true,keyboard:false,circular:false,trails:.4,title:'UNTITLED',bpm:120,key:'—'};
export const looks:Record<PresetId,{name:string;description:string;config:Partial<Config>}>= {
 'blob-mono':{name:'Blob Mono',description:'Organic particles / object tracking',config:{accent:'#e7e8ee',secondary:'#9da8b8',background:'#101115',grid:false,glow:2,density:900}},
 'blob-thermal':{name:'Blob Thermal',description:'Pixel heat field / MIDI hotspots / tracking',config:{background:'#09060e',accent:'#ff792e',secondary:'#c83261',textColor:'#bceef0',grid:false,glow:0}},
 'blob-paper':{name:'Blob Paper',description:'Ink ribbons / technical guides',config:{background:'#eee9dd',accent:'#1d1b19',secondary:'#bd2222',textColor:'#222222',grid:false,glow:0,density:650}},
 domino:{name:'Domino',description:'Note-timed falling structures',config:{background:'#eee9f3',accent:'#8052ce',secondary:'#dd9472',textColor:'#231b32',grid:false,glow:0}},
 scope:{name:'Scope',description:'Oscilloscope / frequency measurement',config:{accent:'#6aff9e',secondary:'#245e42'}},
 transit:{name:'Transit',description:'Notes become routes and stations',config:{background:'#f8f5ed',accent:'#ed623b',secondary:'#5288e5',textColor:'#202020',grid:false,glow:0}},
 'piano-roll':{name:'Piano Roll',description:'Pitch, velocity and duration in motion',config:{background:'#0c0c18',accent:'#bd9aff',secondary:'#645d97',keyboard:true,grid:false}},
 spectrum:{name:'Spectrum',description:'Frequency bars / radial spectrum',config:{background:'#0b1215',accent:'#a8eedc',secondary:'#eea3ce',grid:false,glow:3}},
 particles:{name:'Particle Field',description:'Transient bursts / bass drift',config:{background:'#090d1b',accent:'#f3cf91',secondary:'#7292cb',grid:false,glow:5}},
 orbit:{name:'Orbit',description:'Note satellites / orbit trails',config:{background:'#100d17',accent:'#f5ad68',secondary:'#9b8cae',grid:false,glow:5}},
 'aurora':{name:'Aurora Veil',description:'Silk curtains / harmonic wind',config:{background:'#050e19',accent:'#68efd3',secondary:'#9270ed',textColor:'#e5e6eb',grid:false,glow:2}},
 'eclipse':{name:'Solar Eclipse',description:'Black sun / note-driven corona',config:{background:'#10090b',accent:'#ffc77c',secondary:'#f46a4d',textColor:'#e5e6eb',grid:false,glow:2}},
 'prism':{name:'Prism Cathedral',description:'Faceted glass / chromatic refraction',config:{background:'#090c19',accent:'#9ae9ff',secondary:'#c999ff',textColor:'#e5e6eb',grid:false,glow:2}},
 'ocean':{name:'Midnight Ocean',description:'Perspective waves / luminous crests',config:{background:'#06111b',accent:'#64cfdf',secondary:'#697aee',textColor:'#e5e6eb',grid:false,glow:2}},
 'dunes':{name:'Golden Dunes',description:'Contour landscape / shifting sand',config:{background:'#d9c4a3',accent:'#67432b',secondary:'#9c6842',textColor:'#352a22',grid:false,glow:2}},
 'vortex':{name:'Vortex Engine',description:'Spiral tunnel / accelerating note rings',config:{background:'#d1c8b6',accent:'#3e4542',secondary:'#b35c40',textColor:'#282d2b',grid:false,glow:2}},
 'bloom':{name:'Electric Bloom',description:'Layered petals / harmonic flowering',config:{background:'#eee8dc',accent:'#53694e',secondary:'#a16f69',textColor:'#29352c',grid:false,glow:2}},
 'constellation':{name:'Constellation Atlas',description:'Stellar connections / pitch constellations',config:{background:'#070f1c',accent:'#dbe8ff',secondary:'#789fcc',textColor:'#e5e6eb',grid:false,glow:2}},
 'ribbons':{name:'Liquid Ribbons',description:'Interlaced silk / flowing note tension',config:{background:'#0b1015',accent:'#f5b9a2',secondary:'#83ddd0',textColor:'#e5e6eb',grid:false,glow:2}},
 'monolith':{name:'Monolith',description:'Architectural bars / illuminated edges',config:{background:'#e0e0d5',accent:'#59615a',secondary:'#ad7656',textColor:'#28302d',grid:false,glow:2}},
 'rain':{name:'Neon Rain',description:'Refracted rainfall / MIDI splashes',config:{background:'#070d17',accent:'#6ae2e2',secondary:'#cd8bff',textColor:'#e5e6eb',grid:false,glow:2}},
 'kaleido':{name:'Kaleidoscope',description:'Radial mosaic / evolving symmetry',config:{background:'#160b1b',accent:'#f0ae88',secondary:'#b47ef1',textColor:'#e5e6eb',grid:false,glow:2}},
 'vinyl':{name:'Vinyl Noir',description:'Precision grooves / luminous needle',config:{background:'#101010',accent:'#e3c698',secondary:'#848ca4',textColor:'#e5e6eb',grid:false,glow:2}},
 'topography':{name:'Topographic Pulse',description:'Nested contour maps / seismic notes',config:{background:'#e9e5d8',accent:'#364f51',secondary:'#b46b4b',textColor:'#263638',grid:false,glow:2}},
 'city':{name:'Afterhours City',description:'Isometric towers / illuminated windows',config:{background:'#09121d',accent:'#81d7dc',secondary:'#e7b387',textColor:'#e5e6eb',grid:false,glow:2}},
 'portal':{name:'Infinity Portal',description:'Nested gates / perspective flight',config:{background:'#0d0915',accent:'#ba94ec',secondary:'#f0a899',textColor:'#e5e6eb',grid:false,glow:2}},
 'ink':{name:'Sumi Motion',description:'Calligraphic arcs / note-pressure strokes',config:{background:'#eee7d8',accent:'#292f33',secondary:'#a43c36',textColor:'#263638',grid:false,glow:2}},
 'helix':{name:'Double Helix',description:'Twisting strands / pitch-linked bridges',config:{background:'#07191b',accent:'#83eadb',secondary:'#e3b99b',textColor:'#e5e6eb',grid:false,glow:2}},
 'radar':{name:'Deep Radar',description:'Rotating sweep / note echoes',config:{background:'#081511',accent:'#98d9a2',secondary:'#457e6b',textColor:'#e5e6eb',grid:false,glow:2}},
 'chroma':{name:'Chroma Weave',description:'Woven interference / chromatic threads',config:{background:'#13101d',accent:'#e1a9da',secondary:'#a4c7e4',textColor:'#e5e6eb',grid:false,glow:2}},
 'ladder':{name:'Ladder',description:'Sample RMS / peak / band meters',config:{background:'#f2f2ec',accent:'#344d44',secondary:'#d4714b',textColor:'#343933',grid:false,glow:0}},
 'sheet':{name:'Sheet',description:'Four staves / live MIDI notation',config:{background:'#fafaf3',accent:'#35998d',secondary:'#b57d2e',textColor:'#343933',grid:false,glow:0}},
 'receipt':{name:'Receipt',description:'Printed MIDI event log',config:{background:'#292925',accent:'#252722',secondary:'#a47346',textColor:'#343933',grid:false,glow:0}},
 'rack':{name:'Rack',description:'Waveform / spectrum / band history',config:{background:'#0a1012',accent:'#c9ef71',secondary:'#6b9155',textColor:'#e7eddc',grid:false,glow:0}},
 'screen':{name:'Screen',description:'Chromatic pixel notes / woven display',config:{background:'#eee6cf',accent:'#155b99',secondary:'#d55960',textColor:'#343933',grid:false,glow:0}},
 'strip':{name:'Strip',description:'Fine pitch strips / editorial score',config:{background:'#faf5e7',accent:'#329d96',secondary:'#9774c5',textColor:'#343933',grid:false,glow:0}},
 'mono-studio':{name:'Mono Studio',description:'Vertical piano wires / crossing playhead',config:{background:'#f4f4f1',accent:'#315d95',secondary:'#343638',textColor:'#343933',grid:false,glow:0}},
 'rage-field':{name:'Rage Field',description:'Neon piano bars / dark field',config:{background:'#030706',accent:'#4dc3bc',secondary:'#9774dd',textColor:'#e7eddc',grid:false,glow:0}},
 'rage-night':{name:'Rage Night',description:'Floating dark audio and MIDI windows',config:{background:'#111019',accent:'#b793f4',secondary:'#6d5a92',textColor:'#e7eddc',grid:false,glow:0}},
 'trap-phosphor':{name:'Trap Phosphor',description:'Green CRT / vertical MIDI phosphor',config:{background:'#030a05',accent:'#7ae03f',secondary:'#2e864b',textColor:'#e7eddc',grid:false,glow:0}},
 'pocket-player':{name:'Pocket Player',description:'Silver portable player / LCD notes',config:{background:'#ecf2ee',accent:'#54761c',secondary:'#b6d95e',textColor:'#343933',grid:false,glow:0}},
 'desktop-player':{name:'Desktop Player',description:'Warm desktop / waveform and MIDI windows',config:{background:'#f3eddf',accent:'#c75d3c',secondary:'#7a9861',textColor:'#343933',grid:false,glow:0}},
 'tall-studio':{name:'Tall Studio',description:'Minimal workstation / framed MIDI score',config:{background:'#f2f0df',accent:'#a2b55e',secondary:'#d3ae65',textColor:'#343933',grid:false,glow:0}},
 'blueprint':{name:'Blueprint',description:'Fine piano grid / cyan notes',config:{background:'#edf3f4',accent:'#4daab2',secondary:'#a08bd3',textColor:'#343933',grid:false,glow:0}},
 'brushed-dots':{name:'Brushed Dots',description:'Brushed metal / velocity note punches',config:{background:'#dddcd5',accent:'#444943',secondary:'#91968c',textColor:'#343933',grid:false,glow:0}}
};
export const numericControls:Partial<Record<keyof Config,[number,number,number]>>={textSize:[8,60,1],size:[.2,3,.1],speed:[.1,4,.1],intensity:[0,3,.1],glow:[0,35,1],blur:[0,8,.5],opacity:[.1,1,.05],density:[50,1600,50],lineWidth:[.5,6,.5],bass:[0,3,.1],mid:[0,3,.1],treble:[0,3,.1],transient:[0,3,.1],smoothing:[0,.95,.05],velocity:[0,2,.1],noteScale:[.2,3,.1],trails:[0,1,.05]};
export function validateConfig(v:unknown):v is Config{if(!v||typeof v!=='object')return false;const c=v as Config;if(!presetIds.includes(c.preset)||!['9:16','16:9','1:1'].includes(c.ratio)||!['Balanced','Hero','Minimal','Scene'].includes(c.layout))return false;for(const key of ['background','accent','secondary','textColor'] as const)if(!/^#[a-f0-9]{6}$/i.test(c[key]))return false;for(const [key,range] of Object.entries(numericControls)) {const n=c[key as keyof Config];if(typeof n!=='number'||!Number.isFinite(n)||n<range[0]||n>range[1])return false;}return typeof c.title==='string'&&c.title.length<=120&&typeof c.key==='string'&&c.key.length<30&&Number.isFinite(c.bpm)&&c.bpm>=0&&c.bpm<=300&&['monospace','sans-serif','serif'].includes(c.font)&&['grid','safe','labels','keyboard','circular'].every(k=>typeof c[k as keyof Config]==='boolean');}
export interface Project{id:string;owner:string;name:string;updated:number;config:Config;layers:MidiLayer[];audio?:Blob;audioName:string;start:number;end:number;volume:number;loop:boolean;fps:30|60;audioEnabled:boolean;}
export function presetConfig(id:PresetId):Config{return {...defaults,...looks[id].config,preset:id};}
