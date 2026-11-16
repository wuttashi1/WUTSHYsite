import {parseMidi} from '@/lib/visualizer/midi';
import type {Signal} from './engine';
/** MIDI is note data, so create a deterministic stereo synth for the XY display. */
export async function midiSignal(bytes:ArrayBuffer,progress:(n:number)=>void=()=>{}){
 const tracks=parseMidi(bytes);
 const notes=tracks.flatMap((track,index)=>track.notes.map(note=>({...note,track:index}))).filter(n=>n.velocity>0&&n.duration>0);
 if(!notes.length)throw new Error('MIDI contains no playable notes.');
 let end=0,work=0;const sampleRate=48000,release=.12;
 for(const n of notes){if(![n.time,n.duration,n.velocity,n.midi].every(Number.isFinite)||n.time<0)throw new Error('Invalid MIDI note data.');end=Math.max(end,n.time+n.duration);work+=Math.ceil((n.duration+release)*sampleRate);}
 if(end>600)throw new Error('MIDI limit: 10 minutes.');
 if(work>80_000_000)throw new Error('MIDI is too dense. Export a shorter passage or fewer tracks.');
 const duration=end+release,channels=[new Float32Array(Math.ceil(duration*sampleRate)),new Float32Array(Math.ceil(duration*sampleRate))];let done=0,budget=0;
 for(const n of notes){const start=Math.round(n.time*sampleRate),length=Math.ceil((n.duration+release)*sampleRate),frequency=440*2**((n.midi-69)/12),phase=n.track*.37;
  for(let i=0;i<length&&start+i<channels[0].length;i++){const t=i/sampleRate,attack=Math.min(1,t/.008),tail=t<n.duration?1:Math.max(0,1-(t-n.duration)/release),envelope=attack*tail*n.velocity*.3,a=2*Math.PI*frequency*t;
   channels[0][start+i]+=envelope*(Math.sin(a)+.18*Math.sin(2*a+phase));
   channels[1][start+i]+=envelope*(Math.cos(a+phase)+.18*Math.sin(3*a));
   if(++budget>=262144){budget=0;progress(Math.min(.95,(done+i)/work));await new Promise<void>(resolve=>setTimeout(resolve,0));}
  }done+=length;
 }
 let peak=1;for(let i=0;i<channels[0].length;i++){peak=Math.max(peak,Math.abs(channels[0][i]),Math.abs(channels[1][i]));}
 const scale=.85/peak;for(const channel of channels)for(let i=0;i<channel.length;i++)channel[i]*=scale;
 progress(1);return {signal:{channels,sampleRate,duration} satisfies Signal,notes:notes.length,tracks:tracks.length};
}
