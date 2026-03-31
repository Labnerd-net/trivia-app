import type { Provider } from '../types';
import { openTDBProvider } from './adapters/opentdb';
import { triviaAPIProvider } from './adapters/triviaapi';
import { allOfUsProvider, mindTheGapProvider, tpMillenniumProvider } from './adapters/localProviders';
import { opentdbOfflineProvider, triviaAPIOfflineProvider } from './adapters/snapshotProviders';

export const providers: Record<string, Provider> = {
  opentdb: openTDBProvider,
  triviaapi: triviaAPIProvider,
  allofus: allOfUsProvider,
  mindthegap: mindTheGapProvider,
  tpmillennium: tpMillenniumProvider,
  'opentdb-offline': opentdbOfflineProvider,
  'triviaapi-offline': triviaAPIOfflineProvider,
};

export const providerList = Object.values(providers);
export const providerGroups = [...new Set(providerList.map(p => p.group))];

export function getProvider(id: string): Provider {
  if (!providers[id]) {
    console.warn(`getProvider: unknown provider id "${id}", falling back to opentdb`);
  }
  return providers[id] ?? providers.opentdb;
}
