import {redirect} from 'next/navigation';
import {isSiteAdmin} from '@/lib/visualizer/server';
import '@/app/visualizer/visualizer.css';
export default async function Layout({children}:{children:React.ReactNode}){if(!await isSiteAdmin())redirect('/admin/login');return <div className="visualizer">{children}</div>;}
