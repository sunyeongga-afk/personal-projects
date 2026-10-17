import test from 'node:test';
import assert from 'node:assert/strict';
import {countText,pageText} from '../src/apps/pdf-counter/count.js';
test('한글·공백·줄바꿈·탭·유니코드 글자 수',()=>{
  assert.deepEqual(countText('안녕 세계\r\nA\t😀'),{including:8,excluding:6});
  assert.deepEqual(countText('가'),{including:1,excluding:1});
  assert.deepEqual(countText(''),{including:0,excluding:0});
});
test('PDF 텍스트 아이템과 줄바꿈 결합',()=>{
  assert.equal(pageText([{str:'hello',hasEOL:false},{str:' ',hasEOL:false},{str:'world',hasEOL:true},{type:'beginMarkedContent'},{str:'2'}]),'hello world\n2');
});
