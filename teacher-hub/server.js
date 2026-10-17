import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.css':'text/css; charset=utf-8','.json':'application/json'};
export function createHubServer(){
 const server=http.createServer(async(req,res)=>{
  const json=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
   if(!(pathname==='/'||pathname==='/index.html'||pathname.startsWith('/src/')||pathname.startsWith('/styles/')||pathname.startsWith('/vendor/'))){res.writeHead(404);return res.end('Not found');}
   const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   const relative=path.relative(root,file).replaceAll(path.sep,'/');
   if(!file.startsWith(root+path.sep)||!(relative==='index.html'||['src/','styles/','vendor/'].some(prefix=>relative.startsWith(prefix)))){res.writeHead(404);return res.end();}
   const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
  }catch(error){if(res.headersSent)return res.end();json(error.status||500,{error:error.status?error.message:'처리에 실패했습니다. 로컬 서버와 저장 폴더를 확인하세요.'});}
 });
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createHubServer().listen(Number(process.env.TEACHER_HUB_PORT||54321),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+(process.env.TEACHER_HUB_PORT||54321)));

