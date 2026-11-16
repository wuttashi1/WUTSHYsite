import {analyze,transcribe} from './dsp';
self.onmessage=(event:MessageEvent)=>{const {samples,sr,mode}=event.data;try{const result=mode?transcribe(samples,sr,mode,p=>self.postMessage({progress:p})):analyze(samples,sr,p=>self.postMessage({progress:p}));self.postMessage({result});}catch{self.postMessage({error:'Audio analysis failed'});}};
