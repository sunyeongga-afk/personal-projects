export function countText(text) {
  const normalized = text.normalize('NFC').replace(/\r\n?/g, '\n');
  return {
    including: Array.from(normalized.replace(/\n/g, '')).length,
    excluding: Array.from(normalized.replace(/\s/gu, '')).length,
  };
}
export function pageText(items) {
  return items.filter(item => typeof item.str === 'string')
    .map(item => item.str + (item.hasEOL ? '\n' : '')).join('');
}
