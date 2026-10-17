import {createBackup} from './validation.js';
export function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function exportData(data){download('teacher-hub-backup-'+new Date().toISOString().slice(0,10)+'.json',createBackup(data));}
