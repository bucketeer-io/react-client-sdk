import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';
import type { BKTEvaluationDetails } from 'bkt-js-client-sdk';

export function useBooleanVariationDetails(
  flagId: string,
  defaultValue: boolean
): BKTEvaluationDetails<boolean> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  // `useMemo` will only recompute the memoized value when one of the `deps` has changed.
  // Keep useMemo version — it’s simpler, correct, and idiomatic as long as
  // the booleanVariationDetails method is pure and sync.
  return useMemo(() => {
    void lastUpdated; // Reference to satisfy ESLint

    if (client) {
      const result = client.booleanVariationDetails(flagId, defaultValue);
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
