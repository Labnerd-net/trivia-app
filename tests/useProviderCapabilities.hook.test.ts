import { renderHook } from '@testing-library/react';
import { useProviderCapabilities } from '../src/hooks/useProviderCapabilities';
import type { Provider } from '../src/types';

function makeProvider(difficultiesCount: number, typesCount: number): Provider {
  return {
    id: 'test',
    name: 'Test',
    description: '',
    group: 'Test',
    requiresToken: false,
    difficulties: Array.from({ length: difficultiesCount }, (_, i) => ({ value: `d${i}`, label: `D${i}` })),
    types: Array.from({ length: typesCount }, (_, i) => ({ value: `t${i}`, label: `T${i}` })),
    getCategories: async () => [],
    getQuestions: async () => ({ results: [] }),
  };
}

describe('useProviderCapabilities', () => {
  it('returns true flags when provider has multiple difficulties and types', () => {
    const { result } = renderHook(() => useProviderCapabilities(makeProvider(4, 3)));
    expect(result.current.hasMultipleDifficulties).toBe(true);
    expect(result.current.hasMultipleTypes).toBe(true);
  });

  it('returns false flags when provider has single difficulty and type', () => {
    const { result } = renderHook(() => useProviderCapabilities(makeProvider(1, 1)));
    expect(result.current.hasMultipleDifficulties).toBe(false);
    expect(result.current.hasMultipleTypes).toBe(false);
  });

  it('returns mixed flags correctly', () => {
    const { result } = renderHook(() => useProviderCapabilities(makeProvider(4, 1)));
    expect(result.current.hasMultipleDifficulties).toBe(true);
    expect(result.current.hasMultipleTypes).toBe(false);
  });
});
