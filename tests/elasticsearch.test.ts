import { describe, it, expect } from 'vitest';
import { sanitize } from '../src/index';

describe('Elasticsearch rules', () => {
  it('removes script blocks', () => {
    const payload = {
      query: {
        script: { source: 'ctx._source.x = 1' },
        match: { title: 'hello' },
      },
    };

    const clean = sanitize(payload, { backend: 'elasticsearch' }) as any;

    expect(clean.query).toEqual({ match: { title: 'hello' } });
  });

  it('keeps safe fields intact', () => {
    const payload = { aggs: { tags: { terms: { field: 'tag' } } } };
    const clean = sanitize(payload, { backend: 'elasticsearch' });
    expect(clean).toEqual(payload);
  });
});
