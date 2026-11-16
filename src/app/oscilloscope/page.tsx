import {Oscilloscope} from '@/components/oscilloscope/Oscilloscope';
import '../visualizer/visualizer.css';
import './scope.css';
export const metadata={title:'WUTSHY Oscilloscope',description:'Stereo XY audio oscilloscope with five instrument presets.'};
export default function Page(){return <div className="visualizer"><Oscilloscope/></div>;}
