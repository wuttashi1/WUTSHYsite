import 'server-only';
import {createClient} from '@/lib/supabase/server';
import {isSupabaseConfigured} from '@/lib/config';
import {createClient as createServiceClient} from '@supabase/supabase-js';
import {effectiveStatus, type Access} from './access';
export async function visualizerSession(){
 if(!isSupabaseConfigured())return {user:null,admin:false,access:null,status:'PENDING' as const,ready:false};
 const db=await createClient(); const {data:{user}}=await db.auth.getUser();
 if(!user){const {error}=await db.rpc('is_site_admin');return {user:null,admin:false,access:null,status:'PENDING' as const,ready:!error};}
 const [{data:admin,error:roleError},{data:access,error}]=await Promise.all([db.rpc('is_site_admin'),db.from('visualizer_access').select('*').eq('user_id',user.id).maybeSingle()]);
 return {user,admin:admin===true,access:access as Access|null,status:admin===true?'ACTIVE' as const:effectiveStatus(access),ready:!error&&!roleError};
}
export async function assertAccess(){const s=await visualizerSession();if(!s.ready||!s.user||s.status!=='ACTIVE')throw new Error('Access denied');return s;}
export async function isSiteAdmin(){try{return (await visualizerSession()).admin;}catch{return false;}}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
export function adminDb(actor:string){if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Service key missing');return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{'x-admin-id':actor}}});}
