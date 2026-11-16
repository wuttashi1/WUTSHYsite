import {openDB} from 'idb';
import type {Project,Config} from './types';
async function db(){return openDB('wutshy-visualizer',1,{upgrade(db){db.createObjectStore('projects',{keyPath:'id'});db.createObjectStore('presets',{keyPath:'id'});}});}
export async function saveProject(p:Project){const d=await db();await d.put('projects',p);d.close();}
export async function projects(owner:string):Promise<Project[]>{const d=await db();const rows=await d.getAll('projects');d.close();return rows.filter(p=>p.owner===owner).sort((a,b)=>b.updated-a.updated);}
export async function loadProject(id:string,owner:string):Promise<Project|undefined>{const d=await db();const p=await d.get('projects',id);d.close();return p?.owner===owner?p:undefined;}
export async function deleteProject(id:string,owner:string){if(await loadProject(id,owner)){const d=await db();await d.delete('projects',id);d.close();}}
export interface SavedPreset{id:string;owner:string;name:string;config:Config;is_default?:boolean;}
export async function savedPresets(owner:string):Promise<SavedPreset[]>{const d=await db();const rows=await d.getAll('presets');d.close();return rows.filter(p=>p.owner===owner);}
export async function savePreset(p:SavedPreset){const d=await db();await d.put('presets',p);d.close();}
export async function deletePreset(id:string,owner:string){const d=await db();if((await d.get('presets',id))?.owner===owner)await d.delete('presets',id);d.close();}
