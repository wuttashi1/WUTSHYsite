import {redirect} from 'next/navigation';
import {visualizerSession} from '@/lib/visualizer/server';
import {createClient} from '@/lib/supabase/server';
import {Editor} from '@/components/visualizer/Editor';
import {validateConfig} from '@/lib/visualizer/types';
export default async function Page(){const s=await visualizerSession();if(!s.user)redirect('/admin/login');if(!s.admin)redirect('/');const{data}=await(await createClient()).from('visualizer_presets').select('*').eq('published',true).eq('disabled',false).order('is_default',{ascending:false});return <Editor owner={s.user.id} published={(data||[]).filter(p=>validateConfig(p.config)).map(p=>({id:p.id,owner:'admin',name:p.name,config:p.config,is_default:p.is_default}))}/>;}
