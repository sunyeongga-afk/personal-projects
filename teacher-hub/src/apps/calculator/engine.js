export const initial=()=>({value:'0',acc:null,op:null,fresh:true,error:false,expression:''});
const format=n=>{if(!Number.isFinite(n))throw Error('계산 범위를 초과했습니다.');const rounded=Object.is(n,-0)?0:Number(n.toPrecision(12));return rounded!==0&&(Math.abs(rounded)>=1e12||Math.abs(rounded)<1e-9)?rounded.toExponential(11).replace(/\.?0+e/,'e'):String(rounded);};
function compute(a,b,op){if(op==='÷'&&b===0)throw Error('0으로 나눌 수 없습니다.');return format(op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b);}
export function press(state,key){let s={...state};if(key==='AC')return initial();if(s.error){if(!/^[0-9.]$/.test(key))return s;s=initial();}
 try{
 if(/^[0-9.]$/.test(key)){if(s.fresh){s.value='0';s.fresh=false;if(!s.op)s.expression='';}if(key==='.'){if(!s.value.includes('.'))s.value+='.';}else if(s.value.replace(/[^0-9]/g,'').length<12){s.value=s.value==='0'?key:s.value==='-0'?'-'+key:s.value+key;}return s;}
 if(key==='±'){if(Number(s.value)!==0)s.value=s.value.startsWith('-')?s.value.slice(1):'-'+s.value;return s;}
 if(key==='⌫'){if(!s.fresh){s.value=s.value.slice(0,-1);if(!s.value||s.value==='-')s.value='0';}return s;}
 if(['+','−','×','÷'].includes(key)){if(s.op&&!s.fresh)s.value=compute(s.acc,Number(s.value),s.op);s.acc=Number(s.value);s.op=key;s.fresh=true;s.expression=s.value+' '+key;return s;}
 if(key==='='&&s.op){if(s.fresh)return s;s.expression=s.acc+' '+s.op+' '+s.value+' =';s.value=compute(s.acc,Number(s.value),s.op);s.acc=null;s.op=null;s.fresh=true;return s;}
 return s;
 }catch(error){return {...initial(),value:error.message,error:true};}
}
