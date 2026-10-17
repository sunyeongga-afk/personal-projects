// PDF.js uses the standard Uint8Array hexadecimal conversion in recent builds.
if (!Uint8Array.prototype.toHex) {
  Object.defineProperty(Uint8Array.prototype, 'toHex', {
    value() { return Array.from(this, value => value.toString(16).padStart(2, '0')).join(''); },
    configurable: true, writable: true,
  });
}
