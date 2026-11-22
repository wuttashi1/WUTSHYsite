import Link from "next/link";
import {PresetGallery} from "@/components/visualizer/PresetGallery";
export default function Page(){return <div className="v-projects"><h1>Visualizer</h1><p className="v-hint">Private studio / WUTSHY</p><nav className="v-toolbar"><Link className="v-primary" href="/admin/visualizer/editor">Open studio</Link><Link href="/admin/visualizer/projects">My projects</Link><Link href="/admin/visualizer/oscilloscope">Oscilloscope</Link><Link href="/admin/visualizer/presets">Manage presets</Link></nav><PresetGallery/></div>;}
