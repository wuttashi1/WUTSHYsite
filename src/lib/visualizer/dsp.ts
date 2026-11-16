import type {Features,Note} from './types';
// Iterative radix-2 FFT, shared by cached feature extraction and transcription.
function fft(input:Float32Array){const n=input.length,re=Float32Array.from(input),im=new Float32Array(n);for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j)[re[i],re[j]]=[re[j],re[i]];}for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len;for(let i=0;i<n;i+=len)for(let j=0;j<len/2;j++){const cos=Math.cos(a*j),sin=Math.sin(a*j),k=i+j+len/2,rr=re[k]*cos-im[k]*sin,ii=re[k]*sin+im[k]*cos;re[k]=re[i+j]-rr;im[k]=im[i+j]-ii;re[i+j]+=rr;im[i+j]+=ii;}}return re.slice(0,n/2).map((r,i)=>Math.hypot(r,im[i])/n);}
export function analyze(samples:Float32Array,sr:number,progress?:(n:number)=>void):Features{
 const rate=60,frames=Math.ceil(samples.length/sr*rate),wave=new Float32Array(frames*64),rms=new Float32Array(frames),bass=new Float32Array(frames),mid=new Float32Array(frames),high=new Float32Array(frames),onsets=new Float32Array(frames),spectrum=new Float32Array(frames*64),chroma=new Float32Array(12);let prev=new Float32Array(1024),peak=0;
 for(let f=0;f<frames;f++){const pos=Math.floor(f*sr/rate),window=new Float32Array(2048);let power=0;for(let i=0;i<2048;i++){const x=samples[pos+i]||0;window[i]=x*(.5-.5*Math.cos(2*Math.PI*i/2047));power+=x*x;}rms[f]=Math.sqrt(power/2048);for(let j=0;j<64;j++)wave[f*64+j]=samples[pos+Math.floor(j*sr/200/64)]||0;const spec=fft(window);let flux=0;for(let k=1;k<1024;k++){const hz=k*sr/2048,energy=spec[k];if(hz<250)bass[f]+=energy;else if(hz<4000)mid[f]+=energy;else high[f]+=energy;flux+=Math.max(0,energy-prev[k]);if(hz>65&&hz<2100)chroma[((Math.round(69+12*Math.log2(hz/440))%12)+12)%12]+=energy;}
 for(let j=0;j<64;j++){const lo=Math.floor(Math.pow(j/64,2)*1023),hi=Math.max(lo+1,Math.floor(Math.pow((j+1)/64,2)*1023));for(let k=lo;k<hi;k++)spectrum[f*64+j]=Math.max(spectrum[f*64+j],spec[k]*16);}
 onsets[f]=flux;peak=Math.max(peak,flux);prev=spec;if(f%120===0)progress?.(f/frames);
 }
 for(const a of [bass,mid,high,rms]){let max=.001;for(const x of a)max=Math.max(max,x);for(let i=0;i<a.length;i++)a[i]/=max;}
 for(let i=0;i<onsets.length;i++)onsets[i]/=peak||1;
 let best=0,bpm=120;for(let tempo=65;tempo<=190;tempo++){const lag=Math.round(60*rate/tempo);let score=0;for(let i=lag;i<frames;i++)score+=onsets[i]*onsets[i-lag];if(score>best){best=score;bpm=tempo;}}
 const major=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],minor=[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17];let key='Unknown',score=-Infinity;for(let root=0;root<12;root++)for(const [mode,template] of [['major',major],['minor',minor]] as const){let v=0;for(let i=0;i<12;i++)v+=chroma[(i+root)%12]*template[i];if(v>score){score=v;key=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][root]+' '+mode;}}
 return {rate,duration:samples.length/sr,wave,rms,bass,mid,high,onsets,spectrum,bpm,key,confidence:Math.min(.9,best/Math.max(1,frames)*5)};
}
export type TranscriptionMode='MELODY'|'BASS'|'DRUMS'|'POLYPHONIC EXPERIMENTAL';
export function transcribe(samples:Float32Array,sr:number,mode:TranscriptionMode,progress?:(n:number)=>void):Note[]{
 const notes:Note[]=[],hop=Math.floor(sr*.02),size=2048;const open=new Map<number,Note>();let lastEnergy=0;
 for(let pos=0;pos<samples.length;pos+=hop){const frame=new Float32Array(size);let energy=0;for(let i=0;i<size;i++){frame[i]=samples[pos+i]||0;energy+=frame[i]**2;}energy=Math.sqrt(energy/size);const found:{midi:number;confidence:number}[]=[];
 if(mode==='DRUMS'){if(energy>Math.max(.025,lastEnergy*1.65)){const s=fft(frame);let low=0,hi=0;for(let k=1;k<s.length;k++){if(k*sr/size<180)low+=s[k];else hi+=s[k];}notes.push({id:`n${pos}`,time:pos/sr,duration:.1,midi:low>hi*.5?36:energy>.12?38:42,velocity:Math.min(1,energy*5),confidence:.45});}lastEnergy=energy*.3+lastEnergy*.7;}
 else if(energy>.012){if(mode==='POLYPHONIC EXPERIMENTAL'){const s=fft(frame);const peaks=[];for(let k=2;k<s.length-1;k++)if(s[k]>s[k-1]&&s[k]>s[k+1]&&k*sr/size>65&&k*sr/size<2000)peaks.push(k);peaks.sort((a,b)=>s[b]-s[a]);for(const k of peaks.slice(0,4))found.push({midi:Math.round(69+12*Math.log2(k*sr/size/440)),confidence:.3});}
 else{const lo=Math.floor(sr/(mode==='BASS'?350:1200)),hi=Math.min(size-1,Math.floor(sr/(mode==='BASS'?35:80)));let best=0,lag=0;for(let d=lo;d<=hi;d++){let dot=0,a=0,b=0;for(let i=0;i<size-d;i+=2){dot+=frame[i]*frame[i+d];a+=frame[i]**2;b+=frame[i+d]**2;}const score=dot/Math.sqrt(a*b||1);if(score>best){best=score;lag=d;}if(best>.92&&score<best-.03)break;}if(best>.7&&lag)found.push({midi:Math.round(69+12*Math.log2(sr/lag/440)),confidence:best});}}
 const pitches=new Set(found.map(n=>n.midi));for(const [pitch,note] of open)if(!pitches.has(pitch)){if(note.duration>=.06)notes.push(note);open.delete(pitch);}
 for(const pitch of found){if(pitch.midi<0||pitch.midi>127)continue;const note=open.get(pitch.midi);if(note)note.duration=pos/sr-note.time+.02;else open.set(pitch.midi,{id:`n${pos}-${pitch.midi}`,time:pos/sr,duration:.02,midi:pitch.midi,velocity:Math.min(1,energy*4),confidence:pitch.confidence});}
 if(pos%(hop*50)===0)progress?.(pos/samples.length);
 }for(const note of open.values())if(note.duration>=.06)notes.push(note);return notes.sort((a,b)=>a.time-b.time);
}
