import {NextResponse} from 'next/server';
import {visualizerSession,sameOrigin} from '@/lib/visualizer/server';
import {privateDb} from '@/lib/contact-server';
export async function GET(){try{const s=await visualizerSession();return NextResponse.json({status:s.status,ready:s.ready,admin:s.admin,userId:s.user?.id},{status:s.user?200:401,headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Access service unavailable'},{status:503});}}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid origin'},{status:403});
 try{const s=await visualizerSession();if(!s.user)return NextResponse.json({error:'Sign in first'},{status:401});if(!s.ready)return NextResponse.json({error:'Database migration required'},{status:503});
 const limit=await privateDb().rpc('visualizer_rate_limit',{p_user:s.user.id,p_scope:'request',p_limit:5});if(limit.error||!limit.data)return NextResponse.json({error:'Please wait a minute before requesting again'},{status:429});
 if(!s.access){const {error}=await privateDb().from('visualizer_access').insert({user_id:s.user.id});if(error&&error.code!=='23505')throw error;}
 return NextResponse.json({ok:true,status:s.status});}catch{return NextResponse.json({error:'Could not request access'},{status:503});}
}
