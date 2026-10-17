import {parseBackup,validateData,createBackup} from './validation.js';
export const KEY='teacher-hub.apps.v1';
export const empty=()=>({schemaVersion:1,externalApps:[]});
export function read(storage){let raw=null;try{raw=storage.getItem(KEY);return {data:raw===null?empty():parseBackup(raw),error:null,raw};}catch(error){return {data:empty(),error:'저장된 목록을 읽지 못했습니다. '+error.message,raw};}}
export function write(storage,data){const valid=validateData(data);createBackup(valid);try{storage.setItem(KEY,JSON.stringify(valid));}catch{throw Error('브라우저에 저장하지 못했습니다. 저장 공간 또는 사이트 저장 권한을 확인하세요. 입력과 기존 목록은 유지됩니다.');}return valid;}
