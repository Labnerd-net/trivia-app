import { describe, it, expect } from 'vitest';
import { decodeHtml } from '../src/utils';

describe('decodeHtml', () => {
  it('decodes &amp; to &', () => {
    expect(decodeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
  });

  it('decodes &lt; and &gt;', () => {
    expect(decodeHtml('1 &lt; 2 &gt; 0')).toBe('1 < 2 > 0');
  });

  it('decodes &quot;', () => {
    expect(decodeHtml('Say &quot;hello&quot;')).toBe('Say "hello"');
  });

  it('leaves plain strings unchanged', () => {
    expect(decodeHtml('Hello World')).toBe('Hello World');
  });
});
