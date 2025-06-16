import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';
import { BKTEvaluationDetails, BKTValue } from 'bkt-js-client-sdk';

export function useObjectVariationDetails<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): BKTEvaluationDetails<T> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    void lastUpdated; // Reference to satisfy ESLint
    
    if (client) {
      const result = client.objectVariationDetails(flagId, defaultValue);
      if (result) {
        return result as BKTEvaluationDetails<T>;
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
    } satisfies BKTEvaluationDetails<T>;
  }, [client, flagId, defaultValue, lastUpdated]);
}
