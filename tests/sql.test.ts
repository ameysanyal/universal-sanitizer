import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/index';

describe('SQL rules', () => {
  it('strips obvious injection tokens from strings', () => {
    const input = {
      name: "Robert'); DROP TABLE users;--",
      note: 'safe',
    };

    const clean = sanitize(input, { backend: 'sql' }) as any;
    expect(clean.name).toBe('Robert DROP TABLE users');
    expect(clean.note).toBe('safe');
  });

  it('ignores non-strings', () => {
    const input = { age: 25 };
    const clean = sanitize(input, { backend: 'sql' }) as any;
    expect(clean.age).toBe(25);
  });
});
