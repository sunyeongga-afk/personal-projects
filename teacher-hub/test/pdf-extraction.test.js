import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/apps/pdf-counter/compat.js';
// Text extraction does not use canvas transforms; provide the browser constructor for Node import.
globalThis.DOMMatrix ??= class DOMMatrix {};
const {getDocument} = await import('../vendor/pdfjs/build/pdf.mjs');
import {countText,pageText} from '../src/apps/pdf-counter/count.js';
function fixture() {
  const stream='BT /F1 12 Tf 72 720 Td (Hello world!) Tj ET';
  const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let text='%PDF-1.4\n'; const offsets=[0];
  objects.forEach((o,i)=>{offsets.push(text.length);text+=`${i+1} 0 obj\n${o}\nendobj\n`;});
  const xref=text.length;
  text+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('');
  text+=`trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(text);
}
test('실제 PDF 바이트에서 텍스트를 추출하고 글자 수 계산',async()=>{
  const task=getDocument({data:fixture(),useSystemFonts:true,isEvalSupported:false});
  try {
    const pdf=await task.promise; assert.equal(pdf.numPages,1);
    const content=await (await pdf.getPage(1)).getTextContent();
    assert.deepEqual(countText(pageText(content.items)),{including:12,excluding:11});
  } finally { await task.destroy(); }
});
test('손상된 PDF 오류',async()=>{
  const task=getDocument({data:new TextEncoder().encode('broken pdf')});
  try { await assert.rejects(task.promise,{name:'InvalidPDFException'}); }
  finally {await task.destroy();}
});

