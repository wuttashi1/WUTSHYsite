import {NextResponse} from 'next/server';
import {visualizerSession} from '@/lib/visualizer/server';
export async function GET(){try{const s=await visualizerSession();if(!s.user||!s.admin)return NextResponse.json({error:'Forbidden'},{status:s.user?403:401,headers:{'Cache-Control':'no-store'}});return NextResponse.json({status:'ACTIVE',ready:s.ready,admin:true,userId:s.user.id},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Access service unavailable'},{status:503});}}
export async function POST(){return NextResponse.json({error:'Visualizer is administrator-only'},{status:403});}
