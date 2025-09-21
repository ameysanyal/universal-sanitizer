import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/index';

describe('Redis rules', () => {
  it('removes CRLF from keys & values', () => {
    const input: any = { 'user\r\nname': 'a\r\nb' };
    const clean = sanitize(input, { backend: 'redis' }) as any;

    expect(Object.keys(clean)[0]).toBe('user__name');
    expect(clean['user__name']).toBe('ab');
  });

  it('handles nested arrays', () => {
    const input = { list: ['a\r', 'b\n', 'ok'] };
    const clean = sanitize(input, { backend: 'redis' }) as any;
    expect(clean.list).toEqual(['a', 'b', 'ok']);
  });
});
