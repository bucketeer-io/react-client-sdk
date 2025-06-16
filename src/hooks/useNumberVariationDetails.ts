import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';
import type { BKTEvaluationDetails } from 'bkt-js-client-sdk';

export function useNumberVariationDetails(
  flagId: string,
  defaultValue: number
): BKTEvaluationDetails<number> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    void lastUpdated; // Reference to satisfy ESLint

    if (client) {
      const result = client.numberVariationDetails(flagId, defaultValue);
      if (result) {
        return result;
      }
    }

    // Fallback when client is null or when client method returns undefined/null
    return {
      featureId: flagId,
      featureVersion: 0,
      userId: '',
      variationId: '',
      variationName: '',
      variationValue: defaultValue,
      reason: 'DEFAULT',
    };
  }, [client, flagId, defaultValue, lastUpdated]);
}
