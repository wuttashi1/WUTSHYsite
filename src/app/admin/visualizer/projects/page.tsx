import {redirect} from 'next/navigation';
import {visualizerSession} from '@/lib/visualizer/server';
import {Projects} from '@/components/visualizer/Projects';
export default async function Page(){const s=await visualizerSession();if(!s.user)redirect('/admin/login');if(!s.admin)redirect('/');return <Projects owner={s.user.id}/>;}
