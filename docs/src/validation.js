export const MAX_FILE=1024*1024;
export function validateApp(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('프로그램 정보가 올바르지 않습니다.');
 const {id,name,description,url}=value;
 if(typeof id!=='string'||!/^external:[\w-]+$/.test(id)||id.length>100)throw Error('프로그램 ID가 올바르지 않습니다.');
 if(typeof name!=='string'||!name.trim()||name.trim().length>60)throw Error('이름은 1~60자로 입력하세요.');
 if(typeof description!=='string'||description.length>200)throw Error('설명은 200자 이하로 입력하세요.');
 if(typeof url!=='string'||url.length>2048)throw Error('웹주소는 2048자 이하로 입력하세요.');
 let parsed;try{parsed=new URL(url.trim());}catch{throw Error('https://로 시작하는 올바른 웹주소를 입력하세요.');}
 if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('로그인 정보가 없는 http 또는 https 주소만 등록할 수 있습니다.');
 return {id,name:name.trim(),description:description.trim(),url:parsed.href};
}
export function validateData(value){
 if(!value||value.schemaVersion!==1||!Array.isArray(value.externalApps))throw Error('지원하는 버전 1 백업 파일이 아닙니다.');
 if(value.externalApps.length>1000)throw Error('프로그램은 최대 1,000개까지 저장할 수 있습니다.');
 const externalApps=value.externalApps.map(validateApp);const ids=new Set(externalApps.map(a=>a.id));
 if(ids.size!==externalApps.length)throw Error('중복된 프로그램 ID가 있습니다.');
 return {schemaVersion:1,externalApps};
}
export function parseBackup(text){if(new TextEncoder().encode(text).length>MAX_FILE)throw Error('파일 크기는 1MiB 이하만 허용합니다.');let data;try{data=JSON.parse(text);}catch{throw Error('JSON 파일을 읽을 수 없습니다. 파일 내용을 확인하세요.');}return validateData(data);}
export function createBackup(data,exportedAt=new Date().toISOString()){const text=JSON.stringify({...validateData(data),exportedAt},null,2);if(new TextEncoder().encode(text).length>MAX_FILE)throw Error('백업 가능한 목록 크기(1MiB)를 초과했습니다. 항목이나 설명을 줄여주세요.');return text;}
