import {Output,BufferTarget,Mp4OutputFormat,WebMOutputFormat,CanvasSource,AudioBufferSource,canEncodeVideo,canEncodeAudio} from 'mediabunny';
import {renderFrame} from './render';
import type {Config,Features,MidiLayer} from './types';
export interface ExportOptions{config:Config;layers:MidiLayer[];features:Features;audio:AudioBuffer;start:number;end:number;fps:30|60;audioEnabled:boolean;volume:number;format:'mp4'|'webm';signal:AbortSignal;progress:(value:number)=>void;authorize:()=>Promise<void>;}
export async function exportVideo(o:ExportOptions){
 const [width,height]=o.config.ratio==='9:16'?[1080,1920]:o.config.ratio==='16:9'?[1920,1080]:[1080,1080];
 const codec=o.format==='mp4'?'avc':'vp9',audioCodec=o.format==='mp4'?'aac':'opus';
 if(!await canEncodeVideo(codec,{width,height,bitrate:8_000_000})||o.audioEnabled&&!await canEncodeAudio(audioCodec,{sampleRate:48000,numberOfChannels:2}))throw new Error(`${o.format.toUpperCase()} encoding is unavailable in this browser. Try ${o.format==='mp4'?'WebM or desktop Chrome/Edge':'desktop Chrome/Edge'}.`);
 await o.authorize();const duration=o.end-o.start;if(!(duration>0)||duration>300)throw new Error('Export a clip between 0 and 300 seconds.');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;
 const output=new Output({format:o.format==='mp4'?new Mp4OutputFormat({fastStart:'in-memory'}):new WebMOutputFormat(),target:new BufferTarget()});
 const video=new CanvasSource(canvas,{codec,bitrate:8_000_000});output.addVideoTrack(video,{frameRate:o.fps});
 const audio=o.audioEnabled?new AudioBufferSource({codec:audioCodec,bitrate:192000}):null;if(audio)output.addAudioTrack(audio);
 const abort=()=>{void output.cancel().catch(()=>{});};o.signal.addEventListener('abort',abort,{once:true});
 try{await output.start();if(audio){const offline=new OfflineAudioContext(2,Math.ceil(duration*48000),48000);const source=offline.createBufferSource(),gain=offline.createGain();gain.gain.value=o.volume;source.buffer=o.audio;source.connect(gain).connect(offline.destination);source.start(0,o.start,duration);const rendered=await offline.startRendering();if(o.signal.aborted)throw new Error('Export cancelled');await audio.add(rendered);audio.close();}
 const frames=Math.ceil(duration*o.fps);for(let i=0;i<frames;i++){if(o.signal.aborted)throw new Error('Export cancelled');if(i%(o.fps*10)===0)await o.authorize();const timestamp=i/o.fps;renderFrame(ctx,width,height,o.start+timestamp,o.config,o.layers,o.features);await video.add(timestamp,Math.min(1/o.fps,duration-timestamp));o.progress((i+1)/frames);if(i%15===0)await new Promise(r=>setTimeout(r,0));}video.close();await output.finalize();if(o.signal.aborted)throw new Error('Export cancelled');return new Blob([output.target.buffer!],{type:o.format==='mp4'?'video/mp4':'video/webm'});
 }catch(error){await output.cancel().catch(()=>{});throw error;}finally{o.signal.removeEventListener('abort',abort);canvas.width=canvas.height=0;}
}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
