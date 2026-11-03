import type { Provider } from '../types';
import { openTDBProvider } from './adapters/opentdb';
import { triviaAPIProvider } from './adapters/triviaapi';
import { allOfUsProvider, mindTheGapProvider, tpMillenniumProvider } from './adapters/localProviders';
import { opentdbOfflineProvider, triviaAPIOfflineProvider } from './adapters/snapshotProviders';

// Card game datasets are local-only (gitignored, not deployed). Enable with VITE_LOCAL_CARDS=true in .env.local.
const localCardProviders: Record<string, Provider> =
  import.meta.env.VITE_LOCAL_CARDS === 'true'
    ? {
        allofus: allOfUsProvider,
        mindthegap: mindTheGapProvider,
        tpmillennium: tpMillenniumProvider,
      }
    : {};

export const providers: Record<string, Provider> = {
  opentdb: openTDBProvider,
  triviaapi: triviaAPIProvider,
  ...localCardProviders,
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
