import { createEngine } from './engine';
import { mongoRules } from './adapters/mongo';
import { sqlRules } from './adapters/sql';
import { redisRules } from './adapters/redis';
import { elasticsearchRules } from './adapters/elasticsearch';
import type { BackendName, RuleSet, SanitizerOptions } from './types';

/**
 * A registry to store different sets of sanitization rules for various backend types.
 * @type {Map<BackendName, RuleSet>}
 */
const registry = new Map<BackendName, RuleSet>([
  ['mongo', mongoRules],
  ['sql', sqlRules],
  ['redis', redisRules],
  ['elasticsearch', elasticsearchRules],
]);

/**
 * Registers a new set of sanitization rules for a specific backend.
 * @param backend - The name of the backend (e.g., 'mongo', 'sql').
 * @param rules - The RuleSet object containing the sanitization rules.
 */
export function register(backend: BackendName, rules: RuleSet) {
  registry.set(backend, rules);
}

/**
 * Retrieves the sanitization rules for a given backend name.
 * @param backend - The name of the backend.
 * @returns The RuleSet object for the specified backend.
 * @throws {Error} If no rules are registered for the given backend name.
 */
export function getRules(backend: BackendName): RuleSet {
  const base = registry.get(backend);
  if (!base) throw new Error(`No rules registered for backend: ${backend}`);
  return base;
}

/**
 * Merges a base set of rules with a partial override.
 * The override values will replace the base values where they exist.
 * @param base - The base RuleSet to merge from.
 * @param override - An optional partial RuleSet with new values.
 * @returns A new RuleSet object with merged values.
 */
export function mergeRules(base: RuleSet, override?: Partial<RuleSet>): RuleSet {
  if (!override) return base;
  return {
    forbiddenKeys: override.forbiddenKeys ?? base.forbiddenKeys,
    keyReplace: override.keyReplace ?? base.keyReplace,
    sanitizeValue: override.sanitizeValue ?? base.sanitizeValue,
    stripUnknownTypes: override.stripUnknownTypes ?? base.stripUnknownTypes,
  };
}

/**
 * The main sanitization function. It cleans an input object recursively based on a set of rules
 * and options for a specific backend.
 * @param input - The object or value to sanitize.
 * @param options - An object containing sanitization options.
 * @param options.backend - The name of the backend to use for rule lookup.
 * @param [options.maxDepth=50] - The maximum recursion depth to prevent stack overflow.
 * @param [options.rulesOverride] - A partial RuleSet to override the default backend rules.
 * @returns The sanitized object or value.
 */
export function sanitize(input: unknown, options: SanitizerOptions): unknown {
  const { backend, maxDepth = 50, rulesOverride } = options;
  const rules = mergeRules(getRules(backend), rulesOverride);
  const engine = createEngine(rules, { maxDepth });
  return engine(input);
}

export type { RuleSet, SanitizerOptions, BackendName } from './types';
