import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';

export function useStringVariation(
  flagId: string,
  defaultValue: string
): string {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    // Keep reference to the client and lastUpdated to trigger re-evaluation
    // when they change, ensuring the hook is reactive to updates.
    if (client && lastUpdated !== undefined) {
      const variation = client.stringVariation(flagId, defaultValue);
      return variation !== undefined ? variation : defaultValue;
    }
    return defaultValue;
  }, [client, flagId, defaultValue, lastUpdated]);
}
