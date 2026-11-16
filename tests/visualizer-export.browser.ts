import {Input,BlobSource,ALL_FORMATS,VideoSampleSink,AudioBufferSink} from 'mediabunny';
import {exportVideo} from '../src/lib/visualizer/export';
import {presetConfig} from '../src/lib/visualizer/types';
import {analyze} from '../src/lib/visualizer/dsp';
async function run(){const log=document.querySelector('pre')!;log.textContent='Rendering a one-second 1080p H.264/AAC fixture…';try{
 const sr=48000,audio=new AudioBuffer({length:sr*2,sampleRate:sr,numberOfChannels:2});
 for(let ch=0;ch<2;ch++){const pcm=audio.getChannelData(ch);for(let i=0;i<pcm.length;i++){const t=i/sr;pcm[i]=t>=.75&&t<.85?Math.sin(2*Math.PI*440*t)*.6:0;}}
 const features=analyze(audio.getChannelData(0),sr);
 const blob=await exportVideo({config:{...presetConfig('spectrum'),ratio:'16:9'},layers:[],features,audio,start:.5,end:1.5,fps:30,audioEnabled:true,volume:1,format:'mp4',signal:new AbortController().signal,authorize:async()=>{},progress:p=>{log.textContent=`Rendering ${Math.round(p*100)}%`;}});
 const input=new Input({source:new BlobSource(blob),formats:ALL_FORMATS});const video=await input.getPrimaryVideoTrack(),sound=await input.getPrimaryAudioTrack();if(!video||!sound)throw new Error('Missing audio/video track');
 let frames=0,firstVideo=-1,lastVideo=0;for await(const sample of new VideoSampleSink(video).samples()){if(frames===0)firstVideo=sample.timestamp;lastVideo=sample.timestamp;frames++;sample.close();}
 let firstAudio=-1,peakAt=-1,peak=0;for await(const wrapped of new AudioBufferSink(sound).buffers()){if(firstAudio<0)firstAudio=wrapped.timestamp;const pcm=wrapped.buffer.getChannelData(0);for(let i=0;i<pcm.length;i++)if(Math.abs(pcm[i])>peak){peak=Math.abs(pcm[i]);peakAt=wrapped.timestamp+i/wrapped.buffer.sampleRate;}}
 const duration=await input.computeDuration();const report={ok:frames===30&&Math.abs(duration-1)<.08&&Math.abs(firstVideo)<.04&&peakAt>=.23&&peakAt<=.38,frames,firstVideo,lastVideo,firstAudio,peakAt,duration,bytes:blob.size,videoCodec:video.codec,audioCodec:sound.codec};input.dispose();
 await fetch('/artifact',{method:'POST',body:blob});await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});log.textContent=JSON.stringify(report,null,2);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='visualizer-fixture.mp4';a.textContent='Download verified fixture';document.body.append(a);
 }catch(e){const report={ok:false,error:e instanceof Error?e.message:String(e)};log.textContent=JSON.stringify(report,null,2);await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});}}
void run();
