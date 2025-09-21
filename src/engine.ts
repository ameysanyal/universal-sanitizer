import { RuleSet, SanitizerOptions } from './types';
import { isPlainObject, matchForbidden, isProtoPollutionKey } from './utils'; // Imports helper functions for object type checking, pattern matching, and prototype pollution key detection.

// Defines a default maximum depth for recursion to prevent stack overflows with deeply nested or circular data.
const DEFAULT_MAX_DEPTH = 50;

/**
 * Creates a sanitization engine based on provided rules and options.
 * This function acts as a factory, returning a specialized sanitization function.
 *
 * @param rules - An object defining how sanitization should occur (e.g., how to handle values, keys, and unknown types).
 * @param opts - Optional settings for the sanitizer, such as maximum recursion depth.
 * @returns A function that takes an input and returns its sanitized version.
 */
export function createEngine(rules: RuleSet, opts?: Partial<SanitizerOptions>) {
  // Sets the maximum recursion depth for sanitization, defaulting to 50 if not provided in options.
  const maxDepth = opts?.maxDepth ?? DEFAULT_MAX_DEPTH;

  /**
   * The core sanitization function. It recursively processes data.
   *
   * @param input - The data to be sanitized. Can be of any type (unknown).
   * @param depth - The current level of recursion. Used to enforce maxDepth. Defaults to 0.
   * @param seen - A WeakMap to track objects already visited during recursion, preventing infinite loops with circular references. Defaults to undefined.
   * @returns The sanitized output, or undefined if the input is stripped or the max depth is exceeded.
   */
  return function sanitizeObject(
    input: unknown, // The data to be processed.
    depth = 0, // Tracks the current recursion depth.
    seen?: WeakMap<object, unknown> // Used to detect and handle circular references.
  ): unknown {
    // The function returns data of an unknown type, which will be determined by the sanitization process.

    // Security guard: If recursion depth exceeds the limit, stop processing to prevent stack overflow or denial-of-service attacks.
    if (depth > maxDepth) return undefined; // Strips overly deep content.

    // --- Primitive Type Handling ---
    // Gets the type of the input.
    const t = typeof input;
    // Checks if the input is null, undefined, or one of the primitive types (string, number, boolean, bigint).
    if (
      input == null || // Checks for both null and undefined
      t === 'string' ||
      t === 'number' ||
      t === 'boolean' ||
      t === 'bigint'
    ) {
      // If it's a primitive, apply the specific value sanitization rule and return the result.
      return rules.sanitizeValue(input);
    }

    // --- Built-in Object Types Handling ---
    // If the input is a Date or RegExp object, it's generally considered safe and passed through directly.
    if (input instanceof Date || input instanceof RegExp) return input;

    // --- Array Handling ---
    // Checks if the input is an array.
    if (Array.isArray(input)) {
      // If it's an array, recursively sanitize each element, incrementing the depth.
      // Uses .map to create a new array with sanitized elements.
      return input.map((v) => sanitizeObject(v, depth + 1, seen));
    }

    // --- Non-Plain Object Handling ---
    // Uses the utility function to check if the input is NOT a plain JavaScript object (e.g., it might be a Map, Set, Buffer, or an instance of a custom class).
    if (!isPlainObject(input)) {
      // If it's not a plain object:
      // - If 'stripUnknownTypes' option is true, return undefined (strip it out).
      // - Otherwise, return the object as-is (pass it through).
      return rules.stripUnknownTypes ? undefined : input;
    }

    // --- Circular Reference Handling ---
    // Initializes the 'seen' WeakMap if it hasn't been created yet.
    // A WeakMap is used here because it doesn't prevent objects from being garbage collected if they are only referenced by the WeakMap.
    if (!seen) seen = new WeakMap<object, unknown>();
    // Checks if the current object has already been encountered in this recursion path.
    if (seen.has(input as object)) return seen.get(input as object); // If seen, return the previously sanitized version to break the cycle.

    // --- Object Sanitization ---
    // Creates an empty object to store the sanitized properties.
    const out: Record<string, unknown> = {}; // Explicitly typed as Record<string, unknown>
    // Stores the current object and its corresponding empty output object in the 'seen' map.
    // This maps the original object to its sanitized version.
    seen.set(input as object, out);

    // Iterates over each key-value pair in the input object.
    for (const [rawKey, value] of Object.entries(
      input as Record<string, unknown> // Type assertion to ensure Object.entries works.
    )) {
      // Ensures the key is a string, though Object.entries keys are usually strings.
      const key = String(rawKey);

      // SECURITY GUARD: Prevent prototype pollution by entirely skipping dangerous keys.
      if (isProtoPollutionKey(key)) {
        continue; // Skip this iteration if the key is a known pollution risk.
      }
      // SECURITY GUARD: Check if the key matches any forbidden patterns defined in the rules.
      if (matchForbidden(key, rules.forbiddenKeys)) {
        continue; // Skip this iteration if the key is forbidden.
      }

      // Key transformation: If a 'keyReplace' rule is defined, it transforms the key.
      // Otherwise, the original key is used.
      const safeKey = rules.keyReplace
        ? key.replace(rules.keyReplace, '_') // Example: If keyReplace is 'temp-', it might become 'temp_'.
        : key;

      // Recursively sanitize the value of the current property.
      const cleanVal = sanitizeObject(value, depth + 1, seen);

      // If the sanitized value is not undefined (i.e., it wasn't stripped out), add it to the output object.
      if (cleanVal !== undefined) {
        out[safeKey] = cleanVal; // Assign the sanitized value to the potentially transformed key.
      }
    }

    // SECURITY ENHANCEMENT: Explicitly set the prototype of the output object to null.
    // This ensures that the object has no prototype chain, preventing any accidental or malicious prototype pollution through inherited properties.
    Object.setPrototypeOf(out, null);

    // Return the fully sanitized object.
    return out;
  };
}
