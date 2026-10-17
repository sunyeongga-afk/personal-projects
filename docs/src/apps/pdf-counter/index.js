import {countText, pageText} from './count.js';
import './compat.js';

export function mount(root) {
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const back = el('a', '← 프로그램 목록', 'back'); back.href = '#/';
  const panel = el('section', undefined, 'pdf-counter');
  panel.append(el('p', 'PDF / LOCAL TEXT COUNTER', 'eyebrow'), el('h1', 'PDF 글자 수'),
    el('p', '파일은 내 컴퓨터에, 글자 수는 한눈에.', 'lead'));
  const privacy = el('div', undefined, 'pdf-privacy');
  privacy.append(el('strong', '로컬 처리 · 업로드 없음'), el('p', 'PDF와 추출한 글자, 결과는 이 탭의 메모리에서만 처리합니다. 서버 전송·자동 저장·사용 기록 수집 없이, 초기화하거나 도구를 나가면 앱의 참조를 해제합니다.'));
  const box = el('div', undefined, 'pdf-drop');
  const label = el('label', 'PDF 파일을 선택하거나 여기에 놓으세요'); label.htmlFor = 'pdf-file';
  const input = el('input'); input.type = 'file'; input.id = 'pdf-file'; input.accept = '.pdf,application/pdf';
  box.append(label, input, el('p', '한 번에 한 파일 · 최대 50MiB · 텍스트가 포함된 PDF', 'hint'));
  const actions = el('div', undefined, 'form-actions');
  const reset = el('button', '초기화 / 처리 취소'); reset.type = 'button'; actions.append(reset);
  const status = el('p', '', 'hint'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const error = el('p', '', 'error'); error.setAttribute('role', 'alert');
  const results = el('section'); results.setAttribute('aria-label', '글자 수 결과');
  panel.append(privacy, box, actions, status, error, results,
    el('p', '계산 기준: 유니코드 문자 단위(NFC). 공백 포함은 줄바꿈을 제외하고 띄어쓰기·탭을 포함하며, 공백 제외는 모든 공백 문자를 제외합니다. 문장부호·숫자도 셉니다. PDF의 텍스트 배치에 따라 띄어쓰기와 읽기 순서가 원문과 다를 수 있습니다.', 'rule'),
    el('p', '이미지로만 된 스캔 문서는 OCR 없이 셀 수 없습니다. 텍스트와 이미지가 섞인 문서는 추출 가능한 텍스트만 계산합니다. 암호로 잠긴 파일은 잠금을 해제한 사본을 사용하세요.', 'hint'));
  root.append(back, panel);
  let generation = 0, task = null, disposed = false;
  function clear() {
    generation++; const old = task; task = null;
    if (old) void old.destroy().catch(() => {});
    input.value = ''; results.replaceChildren(); error.textContent = ''; status.textContent = '';
    box.classList.remove('dragging');
  }
  reset.onclick = () => { clear(); status.textContent = '파일과 결과를 초기화했습니다.'; input.focus(); };
  async function process(file) {
    clear(); if (!file) return;
    const current = generation;
    const active = () => !disposed && current === generation;
    let owned = null;
    try {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw Error('PDF 파일을 선택하세요.');
      if (file.size > 50 * 1024 * 1024) throw Error('50MiB 이하의 PDF를 선택하세요.');
      if (!file.size) throw Error('빈 파일입니다. 다른 PDF를 선택하세요.');
      status.textContent = 'PDF 처리 도구를 준비하고 있습니다…';
      const pdfjs = await import('../../../../vendor/pdfjs/build/pdf.mjs');
      if (!active()) return;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('./worker.mjs', import.meta.url).href;
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!active()) return;
      owned = pdfjs.getDocument({data: bytes, isEvalSupported: false,
        cMapUrl: new URL('../../../../vendor/pdfjs/cmaps/', import.meta.url).href, cMapPacked: true,
        standardFontDataUrl: new URL('../../../../vendor/pdfjs/standard_fonts/', import.meta.url).href,
        wasmUrl: new URL('../../../../vendor/pdfjs/wasm/', import.meta.url).href});
      task = owned;
      const pdf = await owned.promise;
      const rows = []; let including = 0, excluding = 0;
      for (let n = 1; n <= pdf.numPages; n++) {
        if (!active()) return;
        status.textContent = `${n.toLocaleString()} / ${pdf.numPages.toLocaleString()}페이지 분석 중…`;
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const count = countText(pageText(content.items));
        rows.push(count); including += count.including; excluding += count.excluding; page.cleanup();
      }
      if (!active()) return;
      const summary = el('div', undefined, 'pdf-stats');
      for (const [title, value] of [['공백 포함', including], ['공백 제외', excluding], ['페이지', pdf.numPages]]) {
        const stat = el('div'); stat.append(el('span', title), el('strong', value.toLocaleString())); summary.append(stat);
      }
      results.append(el('h2', file.name), summary);
      const empty = rows.flatMap((r, i) => r.excluding === 0 ? [i + 1] : []);
      if (empty.length) results.append(el('p', `텍스트가 없는 페이지: ${empty.join(', ')}. 빈 페이지 또는 스캔 이미지일 수 있습니다. 해당 페이지의 이미지 속 글자는 결과에 포함되지 않습니다.`, 'error'));
      const details = el('details'); details.append(el('summary', '페이지별 글자 수 보기'));
      const table = el('table'); const head = el('thead'); const header = el('tr');
      for (const title of ['페이지', '공백 포함', '공백 제외']) { const th = el('th', title); th.scope = 'col'; header.append(th); }
      head.append(header); const body = el('tbody');
      rows.forEach((r, i) => { const tr = el('tr'); for (const v of [i + 1, r.including, r.excluding]) tr.append(el('td', v.toLocaleString())); body.append(tr); });
      table.append(head, body); details.append(table); results.append(details);
      status.textContent = excluding ? '분석을 완료했습니다. 결과는 저장되지 않습니다.' : '추출 가능한 텍스트가 없습니다. 스캔 PDF인지 확인하세요.';
    } catch (e) {
      if (active()) { results.replaceChildren(); status.textContent = ''; error.textContent = e.name === 'PasswordException' ? '암호로 잠긴 PDF입니다. 잠금을 해제한 사본을 선택하세요.' : e.name === 'InvalidPDFException' ? '읽을 수 없는 PDF입니다. 파일이 손상되지 않았는지 확인하세요.' : '처리하지 못했습니다. ' + e.message; }
    } finally {
      if (owned) await owned.destroy().catch(() => {});
      if (task === owned) task = null;
    }
  }
  input.onchange = () => { void process(input.files[0]); };
  box.ondragover = event => { event.preventDefault(); box.classList.add('dragging'); };
  box.ondragleave = () => box.classList.remove('dragging');
  box.ondrop = event => { event.preventDefault(); box.classList.remove('dragging'); if (event.dataTransfer.files.length !== 1) { clear(); error.textContent = 'PDF 파일을 한 개씩 놓아주세요.'; } else void process(event.dataTransfer.files[0]); };
  return () => { disposed = true; clear(); };
}

