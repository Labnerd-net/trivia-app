import { describe, it, expect } from 'vitest';
import { getProvider } from '../src/api/providers';

describe('getProvider', () => {
  it('returns opentdb provider for id "opentdb"', () => {
    const provider = getProvider('opentdb');
    expect(provider.id).toBe('opentdb');
  });

  it('returns triviaapi provider for id "triviaapi"', () => {
    const provider = getProvider('triviaapi');
    expect(provider.id).toBe('triviaapi');
  });

  it('falls back to opentdb for unknown id', () => {
    const provider = getProvider('unknown');
    expect(provider.id).toBe('opentdb');
  });
});
