import { useContext, useMemo } from 'react';
import type { BKTValue } from 'bkt-js-client-sdk';
import { BucketeerContext } from '../context';

export function useObjectVariation<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): T {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    // Keep reference to the client and lastUpdated to trigger re-evaluation
    // when they change, ensuring the hook is reactive to updates.
    if (client && lastUpdated !== undefined) {
      const variation = client.objectVariation(flagId, defaultValue);
      const typeSafeVariation = variation ? variation : defaultValue;
      return typeSafeVariation as T;
    }
    return defaultValue;
  }, [client, flagId, defaultValue, lastUpdated]);
}
