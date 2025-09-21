import { RuleSet } from '../types';

export const mongoRules: RuleSet = {
  // Block Mongo query operators and top-level dangerous keys
  forbiddenKeys: [/^\$/, '__proto__', 'prototype', 'constructor'],
  // Dots in keys are not allowed in Mongo
  keyReplace: /\./g,
  sanitizeValue: (val: unknown) => {
    // Strings can pass as-is; numeric/boolean coercions are NOT done here.
    return val;
  },
  stripUnknownTypes: true,
};
