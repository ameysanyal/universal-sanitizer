import { RuleSet } from '../types';

// Remove scripting from ES DSL and other risky fields
export const elasticsearchRules: RuleSet = {
  // Block any key literally named 'script' at any level
  forbiddenKeys: [/^script$/i],
  keyReplace: undefined,
  sanitizeValue: (val: unknown) => val,
  stripUnknownTypes: true,
};
