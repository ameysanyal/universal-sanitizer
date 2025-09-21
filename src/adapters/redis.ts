import { RuleSet } from '../types';

export const redisRules: RuleSet = {
  forbiddenKeys: [],
  // Prevent CRLF and other control characters in keys
  keyReplace: /[\r\n\u0000]/g,
  sanitizeValue: (val: unknown) => {
    if (typeof val === 'string') {
      return val.replace(/[\r\n\u0000]/g, '');
    }
    return val;
  },
  stripUnknownTypes: true,
};
