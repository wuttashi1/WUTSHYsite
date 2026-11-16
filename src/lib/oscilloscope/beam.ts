// Beam integral adapted from m1el/woscope (MIT), also the line-rendering basis of dood.al.
// Copyright (c) 2015 Igor Null, Chad von Nau. Full notice: /licenses/woscope-MIT.txt.
import type {ScopeConfig,Signal} from './engine';
export const phosphors={
 emerald:{color:[.22,1,.32],decay:.11,width:.65,bloom:.65,curve:.018,frame:.018,name:'P31 / Emerald',description:'Fast green phosphor · crisp beam · soft green wake'},
 amber:{color:[1,.55,.12],decay:.25,width:.85,bloom:.8,curve:.025,frame:.035,name:'P7 / Amber Storage',description:'Long amber persistence · luminous accumulated ribbons'},
 ice:{color:[.52,.86,1],decay:.075,width:.5,bloom:.4,curve:.055,frame:.115,name:'P11 / Polar Tube',description:'Fine ice-blue trace · recessed dark glass · short decay'},
 ruby:{color:[1,.19,.48],decay:.14,width:.75,bloom:1.15,curve:.03,frame:.025,name:'Ruby / Vector',description:'Hot pink beam · broad optical bloom · medium persistence'},
 paper:{color:[.84,1,.9],decay:.045,width:.45,bloom:.3,curve:.045,frame:.065,name:'P4 / Silver Monitor',description:'Fine silver-green phosphor · fast response · smoked glass'}
} as const;
export function beamSegments(c:ScopeConfig,s:Signal,time:number){
 const p=phosphors[c.preset],tau=.006+p.decay*c.persistence*2,history=Math.max(c.windowMs/1000,tau*4),begin=Math.max(0,time-history),end=Math.min(time,s.duration);
 const count=Math.min(48000,Math.ceil((end-begin)*s.sampleRate*c.upsample)),data=new Float32Array(Math.max(0,count)*10);
 const a=s.channels[c.swap?1:0]||s.channels[0],b=s.channels[c.swap?0:1]||a,cos=Math.cos(c.rotation*Math.PI/180),sin=Math.sin(c.rotation*Math.PI/180);
 if(!a||count<=0)return data;
 // Cubic reconstruction removes polygon corners between source samples.
 const sample=(ch:Float32Array,t:number)=>{const pos=t*s.sampleRate,i=Math.floor(pos),f=pos-i;if(i<0||i>=ch.length)return 0;const v=ch[i],v0=ch[Math.max(0,i-1)],v1=ch[Math.min(ch.length-1,i+1)],v2=ch[Math.min(ch.length-1,i+2)];return v+.5*f*(v1-v0+f*(2*v0-5*v+4*v1-v2+f*(3*(v-v1)+v2-v0)));};
 const point=(t:number)=>{const vx=c.mode==='wave'?((t%(c.windowMs/1000))/(c.windowMs/1000)*2-1):sample(a,t)*c.gain,vy=sample(c.mode==='wave'?a:b,t)*c.gain*(c.invertY?-1:1);const x=vx*cos-vy*sin+c.offsetX,y=vx*sin+vy*cos+c.offsetY;const bend=1/(1+p.curve*(x*x+y*y));return [x*bend*.88,y*bend*.88];};
 let prev=point(begin);const dt=(end-begin)/count;
 for(let i=0;i<count;i++){const t=begin+(i+1)*dt,next=point(t),age=time-t;let energy=Math.exp(-age/tau)*dt*48000*c.intensity*.14;
 if(c.mode==='wave'&&Math.abs(next[0]-prev[0])>1)energy=0;
 if(c.channels!=='xy'&&s.channels[2])energy*=Math.max(0,Math.min(1,sample(s.channels[2],t)));
 // Zero signal must not burn a bright dot into the screen.
 if(Math.abs(next[0])+Math.abs(next[1])+Math.abs(prev[0])+Math.abs(prev[1])<1e-8)energy=0;
 const color=c.channels==='xyzrgb'&&s.channels.length>=6?s.channels.slice(3,6).map(ch=>Math.max(0,Math.min(1,sample(ch,t)))):p.color;
 data.set([prev[0],prev[1],next[0],next[1],energy,color[0],color[1],color[2],age,t],i*10);prev=next;
 }return data;
}
const vertex=`attribute vec2 start,end,corner;attribute vec4 light;uniform float radius;varying vec3 uv;varying vec4 power;
void main(){vec2 d=end-start;float len=length(d);d=len>0.000001?d/len:vec2(1.,0.);vec2 n=vec2(-d.y,d.x);float along=corner.x;vec2 pos=mix(start,end,along)+(d*(along*2.-1.)+n*corner.y)*radius;uv=vec3((len+radius*2.)*along-radius,corner.y*radius,len);power=light;gl_Position=vec4(pos,0.,1.);}`;
const fragment=`precision highp float;varying vec3 uv;varying vec4 power;uniform float radius;
float erf(float x){float s=sign(x),a=abs(x);float z=1.+(0.278393+(0.230389+(0.000972+0.078108*a)*a)*a)*a;z*=z;return s-s/(z*z);}
void main(){float sigma=radius/4.;float len=uv.z;float e;if(len<0.000001){e=exp(-dot(uv.xy,uv.xy)/(2.*sigma*sigma));}else{e=(erf((len-uv.x)/(1.41421356*sigma))+erf(uv.x/(1.41421356*sigma)))*exp(-uv.y*uv.y/(2.*sigma*sigma))*.5*radius/len;}gl_FragColor=vec4(power.rgb*min(1.,e*power.a),1.);}`;
const quad=`attribute vec2 point;varying vec2 uv;void main(){uv=point*.5+.5;gl_Position=vec4(point,0.,1.);}`;
const output=`precision highp float;uniform sampler2D image;uniform vec2 pixel;uniform float bloom;varying vec2 uv;
void main(){vec3 core=texture2D(image,uv).rgb;vec3 halo=vec3(0.);for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){vec2 d=vec2(float(x),float(y));float weight=exp(-dot(d,d)*.4);halo+=texture2D(image,uv+d*pixel*5.).rgb*weight*.085;}}vec3 light=core*5.+halo*bloom*2.5;vec3 mapped=1.-exp(-light);gl_FragColor=vec4(pow(mapped,vec3(.7)),1.);}`;
class BeamGPU{
 canvas:HTMLCanvasElement;gl:WebGLRenderingContext;line:WebGLProgram;out:WebGLProgram;buffer:WebGLBuffer;quad:WebGLBuffer;texture:WebGLTexture;fb:WebGLFramebuffer;size=0;
 constructor(){this.canvas=document.createElement('canvas');const gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL unavailable');this.gl=gl;
 const program=(v:string,f:string)=>{const p=gl.createProgram()!;for(const [type,src]of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]as const){const s=gl.createShader(type)!;gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Shader compilation');gl.attachShader(p,s);gl.deleteShader(s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Shader link');return p;};
 this.line=program(vertex,fragment);this.out=program(quad,output);this.buffer=gl.createBuffer()!;this.quad=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);this.texture=gl.createTexture()!;this.fb=gl.createFramebuffer()!;
 }
 draw(size:number,c:ScopeConfig,segments:Float32Array){const gl=this.gl,p=phosphors[c.preset];if(gl.isContextLost())throw Error('WebGL context lost');if(this.size!==size){this.size=size;this.canvas.width=this.canvas.height=size;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.bindFramebuffer(gl.FRAMEBUFFER,this.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.texture,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Framebuffer unavailable');}
 gl.viewport(0,0,size,size);gl.bindFramebuffer(gl.FRAMEBUFFER,this.fb);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.line);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 const count=segments.length/10,vertices=new Float32Array(count*60),corners=[0,-1,1,-1,0,1,0,1,1,-1,1,1];for(let i=0;i<count;i++){const o=i*10;for(let k=0;k<6;k++)vertices.set([segments[o],segments[o+1],segments[o+2],segments[o+3],corners[k*2],corners[k*2+1],segments[o+5],segments[o+6],segments[o+7],segments[o+4]],i*60+k*10);}
 gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);for(const [name,n,offset]of [['start',2,0],['end',2,8],['corner',2,16],['light',4,24]]as const){const loc=gl.getAttribLocation(this.line,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,40,offset);}gl.uniform1f(gl.getUniformLocation(this.line,'radius'),Math.max(.0015,c.focus*p.width*5/size));gl.drawArrays(gl.TRIANGLES,0,count*6);
 for(let i=0;i<4;i++)gl.disableVertexAttribArray(i);gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.useProgram(this.out);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);const loc=gl.getAttribLocation(this.out,'point');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(gl.getUniformLocation(this.out,'image'),0);gl.uniform2f(gl.getUniformLocation(this.out,'pixel'),1/size,1/size);gl.uniform1f(gl.getUniformLocation(this.out,'bloom'),p.bloom);gl.drawArrays(gl.TRIANGLES,0,6);return this.canvas;
 }
 dispose(){const gl=this.gl;gl.deleteBuffer(this.buffer);gl.deleteBuffer(this.quad);gl.deleteTexture(this.texture);gl.deleteFramebuffer(this.fb);gl.deleteProgram(this.line);gl.deleteProgram(this.out);gl.getExtension('WEBGL_lose_context')?.loseContext();}
}
const renderers=new WeakMap<object,BeamGPU|null>();
export function disposeBeam(ctx:CanvasRenderingContext2D){renderers.get(ctx)?.dispose();renderers.delete(ctx);}
export function paintBeam(ctx:CanvasRenderingContext2D,size:number,c:ScopeConfig,s:Signal,time:number,x:number,y:number,w:number,h:number){const segments=beamSegments(c,s,time);let gpu=renderers.get(ctx);if(gpu===undefined){try{gpu=typeof document!=='undefined'?new BeamGPU():null;}catch{gpu=null;}renderers.set(ctx,gpu);}if(gpu){try{ctx.drawImage(gpu.draw(size,c,segments),x,y,w,h);return 'webgl';}catch{gpu.dispose();renderers.set(ctx,null);}}
 // Reduced Canvas fallback preserves signal geometry and time decay.
 const p=phosphors[c.preset];ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineWidth=c.focus*p.width*.8;for(let band=0;band<16;band++){ctx.beginPath();for(let i=0;i<segments.length;i+=10){const speed=Math.hypot(segments[i+2]-segments[i],segments[i+3]-segments[i+1]);const energy=Math.min(.95,segments[i+4]*.025/Math.max(.002,speed));if(Math.floor(energy*15)!==band||energy===0)continue;ctx.moveTo(x+(segments[i]+1)*w/2,y+(1-segments[i+1])*h/2);ctx.lineTo(x+(segments[i+2]+1)*w/2,y+(1-segments[i+3])*h/2);}ctx.strokeStyle=`rgba(${p.color.map(v=>Math.round(v*255)).join(',')},${(band+.5)/16})`;ctx.shadowColor=`rgb(${p.color.map(v=>Math.round(v*255)).join(',')})`;ctx.shadowBlur=4*p.bloom;ctx.stroke();}ctx.restore();return 'canvas';}
