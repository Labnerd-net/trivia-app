import type { Provider } from '../types';

export function useProviderCapabilities(provider: Provider) {
  return {
    hasMultipleDifficulties: provider.difficulties.length > 1,
    hasMultipleTypes: provider.types.length > 1,
  };
}
