import { RuleSet } from '../types';

// NOTE: Always use parameterized queries. This only reduces obvious patterns.
export const sqlRules: RuleSet = {
  forbiddenKeys: [],
  keyReplace: /;/g, // semicolons in dynamic key names -> replace
  sanitizeValue: (val: unknown) => {
    if (typeof val !== 'string') return val;
    // Remove common injection tokens: quotes, comment starts, semicolons, null byte, etc.
    return val
      .replace(/[\u0000\u0008\u0009\u001a\n\r\t]/g, '') // control chars
      .replace(/(--|;|\/\*|\*\/)/g, '') // comments & statement terminators
      .replace(/["'\\()]/g, ''); // quotes and backslash
  },
  stripUnknownTypes: true,
};
