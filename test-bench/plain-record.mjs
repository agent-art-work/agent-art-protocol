/** Accept JSON records from another JavaScript realm, but not class instances. */
export function isPlainRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  const constructor = Object.getOwnPropertyDescriptor(proto, 'constructor')?.value;
  return Object.getPrototypeOf(proto) === null && typeof constructor === 'function'
    && Function.prototype.toString.call(constructor) === Function.prototype.toString.call(Object);
}
