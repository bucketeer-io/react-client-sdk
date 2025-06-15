import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';

export function useNumberVariation(
  flagId: string,
  defaultValue: number
): number {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    // Keep reference to the client and lastUpdated to trigger re-evaluation
    // when they change, ensuring the hook is reactive to updates.
    if (client && lastUpdated !== undefined) {
      const variation = client.numberVariation(flagId, defaultValue);
      return variation !== undefined ? variation : defaultValue;
    }
    return defaultValue;
  }, [client, flagId, defaultValue, lastUpdated]);
}
