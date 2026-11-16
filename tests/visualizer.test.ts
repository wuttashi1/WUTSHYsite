import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createHash} from 'node:crypto';
import {Midi} from '@tonejs/midi';
import {effectiveStatus,type Access} from '../src/lib/visualizer/access';
import {parseMidi,encodeMidi,activeNotes} from '../src/lib/visualizer/midi';
import {analyze,transcribe} from '../src/lib/visualizer/dsp';
import {renderFrame} from '../src/lib/visualizer/render';
import {defaults,presetIds,presetConfig,validateConfig,type MidiLayer} from '../src/lib/visualizer/types';
const now=Date.parse('2026-10-09T12:00:00Z');
const access:Access={user_id:'test',access_status:'ACTIVE',access_type:'TEMPORARY',access_start:'2026-10-08T00:00:00Z',access_expires:'2026-10-10T00:00:00Z'};
test('Access is fail-closed, expires at boundary, and respects suspension',()=>{assert.equal(effectiveStatus(null,now),'PENDING');assert.equal(effectiveStatus(access,now),'ACTIVE');assert.equal(effectiveStatus({...access,access_expires:new Date(now).toISOString()},now),'EXPIRED');assert.equal(effectiveStatus({...access,access_expires:'invalid'},now),'EXPIRED');assert.equal(effectiveStatus({...access,access_status:'SUSPENDED'},now),'SUSPENDED');assert.equal(effectiveStatus({...access,access_type:'PERMANENT',access_expires:null},now),'ACTIVE');assert.equal(effectiveStatus({...access,access_start:'2099-01-01'},now),'PENDING');});
test('Type 1 MIDI tempo changes preserve note timestamps and channel',()=>{const m=new Midi();m.header.tempos=[{ticks:0,bpm:120},{ticks:480,bpm:60}];m.header.update();const t=m.addTrack();t.channel=3;t.name='Melody';t.addNote({midi:60,ticks:480,durationTicks:480,velocity:.7});const bytes=m.toArray(),layers=parseMidi(bytes.buffer as ArrayBuffer);assert.equal(layers[0].channel,3);assert.equal(layers[0].notes[0].time,.5);assert.equal(layers[0].notes[0].duration,1);const encoded=encodeMidi(layers,120);const roundtrip=parseMidi(encoded.buffer as ArrayBuffer);assert.equal(roundtrip[0].notes[0].duration,1);});
const layer:MidiLayer={id:'test',name:'Fixture',notes:[{id:'n',time:0,duration:.5,midi:60,velocity:.8}],channel:0,instrument:'Piano',enabled:true,color:'#ff7700',offset:1,repeat:true,length:2};
test('MIDI clock handles offsets, repeat and note-off exactly',()=>{assert.equal(activeNotes([layer],.9).length,0);assert.equal(activeNotes([layer],1).length,1);assert.equal(activeNotes([layer],1.5).length,0);assert.equal(activeNotes([layer],3.1).length,1);assert.equal(activeNotes([{...layer,enabled:false}],3.1).length,0);});
const sr=22050,samples=Float32Array.from({length:sr*2},(_,i)=>Math.sin(2*Math.PI*440*i/sr)*.4);const features=analyze(samples,sr);
test('Local analysis and melody transcription follow a 440Hz fixture',()=>{assert.equal(features.duration,2);assert.equal(features.rms.length,120);assert(features.spectrum.some(x=>x>0));const notes=transcribe(samples,sr,'MELODY');assert(notes.length>0);assert(notes.some(n=>Math.abs(n.midi-69)<=1));assert(notes.every(n=>Number.isFinite(n.time)&&n.duration>0));});
const hashes=new Set<string>();
for(const id of presetIds)test(`${id}: real pixels, animated and deterministic after seeking`,()=>{const canvas=createCanvas(360,480),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D,c=presetConfig(id);const hash=()=>createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex');renderFrame(ctx,360,480,.15,c,[layer],features);const first=hash();renderFrame(ctx,360,480,1.2,c,[layer],features);const second=hash();assert.notEqual(first,second);renderFrame(ctx,360,480,.15,c,[layer],features);assert.equal(first,hash());hashes.add(first);});
test('Distinct renderer outputs and strict config validation',()=>{assert.equal(hashes.size,presetIds.length);assert(validateConfig(defaults));assert(!validateConfig({...defaults,density:Infinity}));assert(!validateConfig({...defaults,background:'javascript:bad'}));});

for(const id of presetIds.filter(id=>id!=='ladder'))test(`${id}: MIDI changes geometry with labels disabled`,()=>{const canvas=createCanvas(240,320),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D,c={...presetConfig(id),labels:false};const hash=()=>createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex');renderFrame(ctx,240,320,1.2,c,[layer],features);const withMidi=hash();renderFrame(ctx,240,320,1.2,c,[{...layer,notes:[]}],features);assert.notEqual(withMidi,hash());});

test("Zero BPM persists; MIDI export rejects undefined tempo",()=>{assert(validateConfig({...defaults,bpm:0}));assert.throws(()=>encodeMidi([layer],0),/BPM/);});
