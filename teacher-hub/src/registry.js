import {mount as mountPdf} from './apps/pdf-counter/index.js';
import {mount} from './apps/calculator/index.js';
export const apps=[{id:'builtin:calculator',name:'계산기',description:'사칙연산부터 소수점까지. 빠르게 열고, 간단하게 계산하세요.',route:'/apps/calculator',mount},{id:'builtin:pdf-counter',name:'PDF 글자 수',description:'PDF를 업로드 없이 로컬에서 분석합니다. 공백 포함·제외와 페이지별 글자 수.',route:'/apps/pdf-counter',mount:mountPdf}];
export function checkRegistry(list){if(new Set(list.map(a=>a.id)).size!==list.length||new Set(list.map(a=>a.route)).size!==list.length)throw Error('내부 앱 ID 또는 경로가 중복되었습니다.');for(const a of list)if(!a.id.startsWith('builtin:')||!a.route.startsWith('/apps/')||typeof a.mount!=='function')throw Error('내부 앱 등록 형식이 올바르지 않습니다.');}


