// This function checks if a given value is a simple, "plain" JavaScript object created with {} or new Object().
// It specifically ignores arrays, null, or objects from a different class.
export const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === '[object Object]';

//These three keys are commonly used in prototype pollution attacks.
const PP_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

//This function is a security check that helps prevent prototype pollution attacks. It checks if a given string key is one of the three dangerous property names: __proto__, prototype, or constructor.
// An attacker could use these keys to modify the behavior of all objects in an application.
export const isProtoPollutionKey = (k: string) => PP_KEYS.has(k);

//This function is a utility that checks if a given string key matches any of the patterns in an array. The patterns can be either simple strings (for a startsWith check) or regular expressions (for a more complex check).
//It's a versatile function for validating or sanitizing user-provided input against a list of forbidden strings.
export const matchForbidden = (key: string, patterns: Array<string | RegExp>) => {
  for (const p of patterns) {
    if (typeof p === 'string') {
      if (key.startsWith(p)) return true;
    } else {
      if (p.test(key)) return true;
    }
  }
  return false;
};
