import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/index';

describe('Mongo rules', () => {
  it('removes $ operator keys and dot-replaces', () => {
    const input = {
      username: { $gt: '' },
      profile: { 'na.me': 'alice', $where: 'this.x === 1' },
      $comment: 'nope',
    } as any;

    const clean = sanitize(input, { backend: 'mongo' }) as any;

    expect(clean).toEqual({
      username: {},
      profile: { na_me: 'alice' },
    });
  });

  it('strips prototype pollution keys', () => {
    const input: any = { __proto__: { admin: true } };
    const clean = sanitize(input, { backend: 'mongo' });
    expect((clean as any).__proto__).toBeUndefined();
  });
});
