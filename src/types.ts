export type SanitizeFn = (val: unknown) => unknown;

export interface RuleSet {
  /** Keys to block entirely. String = prefix match; RegExp = test() */
  forbiddenKeys: Array<string | RegExp>;
  /** Replace matching chars in keys with '_' */
  keyReplace?: RegExp;
  /** Sanitize individual primitive values */
  sanitizeValue: SanitizeFn;
  /** If true, convert unsupported instances (e.g., functions) to undefined */
  stripUnknownTypes?: boolean;
}

export type BackendName = 'mongo' | 'sql' | 'redis' | 'elasticsearch' | (string & {});

export interface SanitizerOptions {
  backend: BackendName;
  /** Safety: prevent insanely deep payloads */
  maxDepth?: number; // default 50
  /** Merge-in tweaks per call */
  rulesOverride?: Partial<RuleSet>;
}
