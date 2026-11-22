import {redirect} from 'next/navigation';
import {isSiteAdmin} from '@/lib/visualizer/server';
export const metadata={robots:{index:false,follow:false}};
export default async function Layout({children}:{children:React.ReactNode}){if(!await isSiteAdmin())redirect('/admin/login');return children;}
