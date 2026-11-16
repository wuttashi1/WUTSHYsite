import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdir,writeFile} from 'node:fs/promises';
const output=await build({entryPoints:['tests/visualizer-export.browser.ts'],bundle:true,write:false,platform:'browser',format:'iife'});
await mkdir('.visualizer-test',{recursive:true});let result={status:'waiting'};
createServer(async(req,res)=>{
 if(req.method==='GET'&&req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8"><title>WUTSHY export verification</title><body style="background:#111;color:#ddd;font:16px monospace;padding:40px"><h1>Local MP4 export test</h1><pre>Starting…</pre><script src="/test.js"></script>');}
 else if(req.method==='GET'&&req.url==='/test.js'){res.setHeader('Content-Type','application/javascript');res.end(output.outputFiles[0].contents);}
 else if(req.method==='POST'&&['/result','/artifact'].includes(req.url)){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>20e6){res.writeHead(413);res.end();return;}chunks.push(chunk);}const bytes=Buffer.concat(chunks);if(req.url==='/result'){result=JSON.parse(bytes);await writeFile('.visualizer-test/export-result.json',JSON.stringify(result,null,2));console.log(result);}else await writeFile('.visualizer-test/export-fixture.mp4',bytes);res.end('ok');}
 else if(req.url==='/result'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));}else{res.writeHead(404);res.end();}
}).listen(3001,'127.0.0.1',()=>console.log('Export verification: http://127.0.0.1:3001'));
