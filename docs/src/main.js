import {apps,checkRegistry} from './registry.js';
import {read,write,empty} from './storage.js';
import {validateApp,parseBackup,MAX_FILE} from './validation.js';
import {download,exportData} from './backup.js';

const root=document.querySelector('#app'),notice=document.querySelector('#notice');
let store;try{store=window.localStorage;}catch{store={getItem(){throw Error('브라우저 저장 접근이 차단되었습니다.');},setItem(){throw Error('브라우저 저장 접근이 차단되었습니다.');}};}
let loaded=read(store),data=loaded.data,blocked=!!loaded.error,cleanup=()=>{},focusReturn=null;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function button(text,fn,cls=''){const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;}
function status(message){notice.textContent=message;}
function errorBox(){const box=el('p','','error');box.setAttribute('role','alert');return box;}
function back(){const a=el('a','← 프로그램 목록','back');a.href='#/';return a;}
function link(text,url,cls=''){const a=el('a',text,cls);a.href=url;return a;}
function save(next){if(blocked)throw Error('저장된 목록 복구가 필요합니다. 목록 화면에서 원문을 보관한 뒤 초기화하세요.');data=write(store,next);}
function confirmAction(title,message,action){
 const dlg=el('dialog');dlg.setAttribute('aria-labelledby','dialog-title');const heading=el('h2',title);heading.id='dialog-title';const actions=el('div',undefined,'form-actions');const err=errorBox();
 const cancel=button('취소',()=>dlg.close()),yes=button('확인',()=>{try{action();dlg.close();}catch(e){err.textContent=e.message;}},'primary');actions.append(cancel,yes);dlg.append(heading,el('p',message),err,actions);document.body.append(dlg);const previous=document.activeElement;dlg.addEventListener('close',()=>{dlg.remove();if(previous?.isConnected)previous.focus();},{once:true});dlg.showModal();cancel.focus();
}
function recovery(){
 if(!blocked)return;
 const box=el('section',undefined,'recovery');box.append(el('h2','저장된 목록을 확인해 주세요'),el('p',loaded.error));
 box.append(el('p','원문을 보관한 후 초기화하거나, 백업 파일로 복원할 수 있습니다. 확인 전까지 저장된 원문을 변경하지 않습니다.'));
 const actions=el('div',undefined,'actions');const raw=button('저장 원문 내려받기',()=>download('teacher-hub-recovery.json',loaded.raw??''));raw.disabled=loaded.raw===null;
 actions.append(raw,button('목록 초기화',()=>confirmAction('목록 초기화','저장 원문을 보관하셨나요? 현재 저장값을 빈 목록으로 교체합니다. 내부 앱은 유지됩니다.',()=>{data=write(store,empty());loaded={data,error:null,raw:null};blocked=false;render();status('빈 목록으로 초기화했습니다.');})),link('백업 복원으로 이동','#/backup','button'));box.append(actions);root.append(box);
}
function card(app,index,builtin){
 const item=el('article',undefined,'card');const visual=el('div',undefined,'visual'+(builtin?' dark':''));visual.setAttribute('aria-hidden','true');visual.append(el('span',`TOOL / ${String(index+1).padStart(3,'0')}`,'serial'));
 if(builtin && app.id==='builtin:pdf-counter'){visual.append(el('span','PDF / Aa','pdf-symbol'));}else if(builtin){const mini=el('div',undefined,'mini-calculator');mini.append(el('div','0.','mini-screen'));const keys=el('div',undefined,'mini-keys');for(let i=0;i<16;i++)keys.append(el('i'));mini.append(keys);visual.append(mini);}else visual.append(el('span','↗','link-symbol'));
 const actions=el('div',undefined,'actions');const a=link(builtin?app.name+' 실행 →':'웹앱 열기 ↗',builtin?'#'+app.route:app.url,'button');a.setAttribute('aria-label',app.name+' 실행');if(!builtin){a.target='_blank';a.rel='noopener noreferrer';}
 a.dataset.appId=app.id;actions.append(a);if(!builtin){const edit=link('수정 · 삭제','#/edit/'+encodeURIComponent(app.id),'text-button');edit.setAttribute('aria-label',app.name+' 수정 및 삭제');edit.onclick=()=>{focusReturn=app.id;};actions.append(edit);}
 item.append(visual,el('div',builtin?'BUILT-IN / 내부 앱':'WEB LINK / 외부 앱','tag'),el('h3',app.name),el('p',app.description||'등록한 웹 프로그램'),actions);return item;
}
function hub(){
 root.innerHTML='<section class="intro"><div><p class="eyebrow">PERSONAL WORKSPACE / 01</p><h1>필요한 도구를,<br>한곳에.</h1></div><p>직접 만든 프로그램과 자주 쓰는 웹앱.<br>선생님의 작은 작업실을 차곡차곡 채워보세요.</p></section>';
 recovery();const section=el('div',undefined,'section-head');section.append(el('span','프로그램 모음 / '+String(apps.length+data.externalApps.length).padStart(2,'0')),link('+ 웹앱 등록','#/new'));root.append(section);const grid=el('div',undefined,'grid');apps.forEach((a,i)=>grid.append(card(a,i,true)));data.externalApps.forEach((a,i)=>grid.append(card(a,apps.length+i,false)));
 if(data.externalApps.length===0){const blank=el('div',undefined,'empty');blank.append(el('div','다음 도구를 위한 자리'),el('p','웹주소를 등록하거나 바이브 코딩으로 새 내부 앱을 추가하세요.'),link('+ 첫 웹앱 등록','#/new'));grid.append(blank);}root.append(grid);root.append(el('p','목록은 현재 브라우저에 저장됩니다. 다른 PC로 옮기려면 백업 파일을 내보내세요.','rule'));
 if(focusReturn){const target=[...root.querySelectorAll('[data-app-id]')].find(n=>n.dataset.appId===focusReturn);target?.focus();focusReturn=null;}
}
function appForm(id){
 const existing=id?data.externalApps.find(a=>a.id===id):null;if(id&&!existing)return missing();
 root.append(back());const panel=el('section',undefined,'panel');panel.append(el('p',existing?'EDIT WEB LINK':'NEW WEB LINK','eyebrow'),el('h1',existing?'웹앱 수정':'새로운 도구 연결'),el('p','자주 사용하는 프로그램의 웹주소를 등록하세요.','lead'));
 const form=el('form');form.noValidate=true;const inputs={};const errors={};
 for(const [key,label,type,max] of [['name','프로그램 이름','text',60],['description','설명 (선택)','textarea',200],['url','웹주소','url',2048]]){
 const wrap=el('div',undefined,'field'),lab=el('label',label);lab.htmlFor=key;const input=el(type==='textarea'?'textarea':'input');input.id=key;input.name=key;if(type!=='textarea')input.type=type;input.maxLength=max;input.value=existing?.[key]||'';if(key!=='description')input.required=true;input.placeholder=key==='url'?'https://example.com':key==='name'?'예: 수업 자료 도구':'어떤 상황에 사용하는 도구인가요?';
 const err=el('p','','hint');err.id=key+'-error';err.setAttribute('role','alert');input.setAttribute('aria-describedby',err.id);wrap.append(lab,input,err);if(key==='url')wrap.append(el('p','http 또는 https 주소만 등록합니다. 비밀번호·접속 토큰이 포함된 주소는 피해주세요.','hint'));inputs[key]=input;errors[key]=err;form.append(wrap);}
 const err=errorBox(),actions=el('div',undefined,'form-actions'),submit=el('button',existing?'변경 저장':'프로그램 등록','primary');submit.type='submit';actions.append(submit,link('취소','#/'));
 if(existing)actions.append(button('프로그램 삭제',()=>confirmAction('프로그램 삭제',`“${existing.name}”을 목록에서 삭제할까요? 웹사이트 자체는 삭제되지 않습니다.`,()=>{save({...data,externalApps:data.externalApps.filter(a=>a.id!==existing.id)});location.hash='#/';status('프로그램을 삭제했습니다.');})));
 form.append(err,actions);form.onsubmit=e=>{e.preventDefault();err.textContent='';Object.keys(errors).forEach(k=>{errors[k].textContent='';inputs[k].removeAttribute('aria-invalid');});try{
 const values={id:existing?.id||'external:'+crypto.randomUUID(),name:inputs.name.value.trim(),description:inputs.description.value.trim(),url:inputs.url.value.trim()};
 if(!values.name){errors.name.textContent='프로그램 이름을 입력하세요.';inputs.name.setAttribute('aria-invalid','true');inputs.name.focus();return;}
 let valid;try{valid=validateApp(values);}catch(e){errors.url.textContent=e.message;inputs.url.setAttribute('aria-invalid','true');inputs.url.focus();return;}
 save({...data,externalApps:existing?data.externalApps.map(a=>a.id===existing.id?valid:a):[...data.externalApps,valid]});focusReturn=valid.id;location.hash='#/';status(existing?'프로그램을 수정했습니다.':'새 프로그램을 등록했습니다.');
 }catch(e){err.textContent=e.message;}};panel.append(form);root.append(panel);
}
function backup(){
 root.append(back());const panel=el('section',undefined,'panel');panel.append(el('p','BACKUP / RESTORE','eyebrow'),el('h1','도구함을 보관하세요.'),el('p','브라우저를 바꾸거나 PC를 옮길 때, 목록도 함께 가져가세요.','lead'));
 const out=el('section',undefined,'box');out.append(el('h2','01 / 목록 내보내기'),el('p',`등록한 외부 웹앱 ${data.externalApps.length}개를 JSON 파일로 저장합니다. 내부 앱의 코드와 계산 기록은 포함하지 않습니다.`));const exp=button('백업 파일 내보내기 ↓',()=>{exportData(data);status('백업 파일 다운로드를 요청했습니다. 브라우저의 다운로드 목록을 확인하세요.');},'primary');exp.disabled=blocked;out.append(exp);
 const into=el('section',undefined,'box');into.append(el('h2','02 / 백업 가져오기'),el('p','파일을 먼저 검증한 뒤 교체할 목록을 보여드립니다. 복원하면 기존 외부 목록 전체가 교체됩니다. 내부 앱은 유지됩니다.'));
 const label=el('label','백업 JSON 파일 선택');label.htmlFor='backup-file';const file=el('input');file.id='backup-file';file.type='file';file.accept='.json,application/json';const err=errorBox(),preview=el('div');const busy=el('p','','hint');busy.setAttribute('role','status');let cancelled=false,pending=null;
 file.onchange=async()=>{pending=null;preview.replaceChildren();err.textContent='';const selected=file.files[0];if(!selected)return;file.disabled=true;busy.textContent='백업 파일을 확인하고 있습니다…';try{if(selected.size>MAX_FILE)throw Error('파일 크기는 1MiB 이하만 허용합니다.');const valid=parseBackup(await selected.text());if(cancelled)return;pending=valid;
 const area=el('div',undefined,'preview');area.append(el('h3',`외부 웹앱 ${valid.externalApps.length}개로 교체`),el('p',`현재 ${data.externalApps.length}개 → 복원 후 ${valid.externalApps.length}개`));const list=el('ul');valid.externalApps.forEach(a=>list.append(el('li',a.name)));area.append(list);if(blocked)area.append(el('p','현재 저장값에 오류가 있습니다. 교체 전에 목록 화면에서 저장 원문을 내려받으세요.'));
 const actions=el('div',undefined,'form-actions');actions.append(button('이 목록으로 교체',()=>confirmAction('백업 목록 복원',`기존 외부 목록을 ${pending.externalApps.length}개 항목으로 교체합니다. 필요한 기존 목록을 먼저 내보내셨나요?`,()=>{data=write(store,pending);blocked=false;loaded={data,error:null,raw:null};status('백업 목록을 복원했습니다.');location.hash='#/';}),'primary'),button('취소',()=>{pending=null;preview.replaceChildren();file.value='';status('복원을 취소했습니다. 기존 목록을 유지합니다.');}));area.append(actions);preview.append(area);
 }catch(e){if(!cancelled)err.textContent=e.message;}finally{file.disabled=false;busy.textContent='';}};
 into.append(label,file,busy,err,preview);panel.append(out,into,el('p','백업 파일은 직접 보관·삭제해 주세요. 사이트 주소·포트·브라우저 프로필이 달라지면 저장 공간도 달라집니다.','rule'));root.append(panel);return ()=>{cancelled=true;};
}
function missing(message='프로그램 또는 페이지를 찾을 수 없습니다.'){root.append(back(),el('h1','잠시 길을 잃었네요.'),el('p',message,'lead'));}
let registryError=null;try{checkRegistry(apps);}catch(e){registryError=e.message;}
function render(){cleanup();cleanup=()=>{};root.replaceChildren();const route=location.hash.slice(1)||'/';document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')==='#'+route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(registryError){missing(registryError);return;}
 if(route==='/')hub();else if(route==='/new')appForm();else if(route.startsWith('/edit/')){try{appForm(decodeURIComponent(route.slice(6)));}catch{missing();}}else if(route==='/backup')cleanup=backup()||(()=>{});else{const app=apps.find(a=>a.route===route);if(app)cleanup=app.mount(root)||(()=>{});else missing();}
 document.title=(route==='/'?'교사 도구함':route==='/backup'?'백업 관리':route==='/new'?'웹앱 등록':route.startsWith('/edit/')?'웹앱 수정':apps.find(a=>a.route===route)?.name||'페이지 안내')+' — 개인 프로그램 허브';
 if(!root.contains(document.activeElement)){const heading=root.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
document.addEventListener('click',event=>{if(event.target.closest('a[href^="#/"]'))status('');});
window.addEventListener('storage',event=>{if(event.key===null||event.key==='teacher-hub.apps.v1'){loaded=read(store);data=loaded.data;blocked=!!loaded.error;status('다른 탭의 목록 변경을 반영했습니다.');if((location.hash.slice(1)||'/')==='/')render();}});
render();


