import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
export async function GET(req:Request){const url=new URL(req.url),code=url.searchParams.get('code');if(code){const{error}=await(await createClient()).auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(url.searchParams.get('reset')==='1'?'/visualizer/login?reset=1':'/visualizer',url.origin));}return NextResponse.redirect(new URL('/visualizer/login',url.origin));}
