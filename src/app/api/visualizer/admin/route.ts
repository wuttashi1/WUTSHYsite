import {NextResponse} from 'next/server';
import {visualizerSession,sameOrigin,adminDb} from '@/lib/visualizer/server';
import {effectiveStatus} from '@/lib/visualizer/access';
import {validateConfig} from '@/lib/visualizer/types';
export async function GET(){try{const s=await visualizerSession();if(!s.admin)return NextResponse.json({error:'Forbidden'},{status:403});const db=adminDb(s.user!.id);
 const [{data:users,error:u},{data:access,error:a},{data:presets,error:p},{data:audit,error:l}]=await Promise.all([db.auth.admin.listUsers({page:1,perPage:1000}),db.from('visualizer_access').select('*'),db.from('visualizer_presets').select('*'),db.from('visualizer_audit').select('*').order('id',{ascending:false}).limit(50)]);if(u||a||p||l)throw new Error();
 return NextResponse.json({users:users.users.map(user=>({id:user.id,email:user.email,username:user.user_metadata?.username||'',created_at:user.created_at,last_sign_in_at:user.last_sign_in_at,access:access?.find(v=>v.user_id===user.id)||null,status:effectiveStatus(access?.find(v=>v.user_id===user.id)||null)})),presets,audit},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Management unavailable. Apply the migration and configure the service key.'},{status:503});}}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid origin'},{status:403});
 try{const s=await visualizerSession();if(!s.admin)return NextResponse.json({error:'Forbidden'},{status:403});const raw=await req.text();if(raw.length>20000)return NextResponse.json({error:'Too large'},{status:413});const v=JSON.parse(raw);const db=adminDb(s.user!.id);const limit=await db.rpc('visualizer_rate_limit',{p_user:s.user!.id,p_scope:'admin',p_limit:60});if(limit.error||!limit.data)return NextResponse.json({error:'Please wait a minute before making more changes'},{status:429});
 if(v.kind==='preset'){
 if(v.action==='delete'){if(!/^[0-9a-f-]{36}$/i.test(v.id))throw new Error();const {error}=await db.from('visualizer_presets').delete().eq('id',v.id);if(error)throw error;}
 else{if(typeof v.name!=='string'||!v.name.trim()||v.name.length>80||!validateConfig(v.config))return NextResponse.json({error:'Invalid preset'},{status:400});const row={...(v.id?{id:v.id}:{}),name:v.name,config:v.config,published:!!v.published,disabled:!!v.disabled,is_default:!!v.is_default};const {error}=await db.rpc('save_visualizer_preset',{p_id:row.id||null,p_name:row.name,p_config:row.config,p_published:row.published,p_disabled:row.disabled,p_default:row.is_default});if(error)throw error;}
 }else{
 if(!/^[0-9a-f-]{36}$/i.test(v.user_id)||!['ACTIVE','SUSPENDED','REVOKED','EXPIRED'].includes(v.status))return NextResponse.json({error:'Invalid access change'},{status:400});
 const permanent=v.type==='PERMANENT';const expires=permanent?null:new Date(v.expires).toISOString();if(v.status==='ACTIVE'&&!permanent&&Date.parse(expires!)<=Date.now())return NextResponse.json({error:'Expiration must be in the future'},{status:400});
 const {error}=await db.from('visualizer_access').upsert({user_id:v.user_id,access_status:v.status,access_type:permanent?'PERMANENT':'TEMPORARY',access_start:new Date().toISOString(),access_expires:expires,granted_by:s.user!.id,updated_at:new Date().toISOString()});if(error)throw error;
 }return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Could not save change'},{status:400});}
}
