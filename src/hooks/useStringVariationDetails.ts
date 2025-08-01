import { useContext, useMemo } from 'react';
import type { BKTEvaluationDetails } from '@bucketeer/js-client-sdk';
import { BucketeerContext } from '../context';

export function useStringVariationDetails(
  flagId: string,
  defaultValue: string
): BKTEvaluationDetails<string> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    if (client) {
      const result = client.stringVariationDetails(flagId, defaultValue);
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
    // lastUpdated is intentionally unused but needed in dependency array
    // to trigger re-evaluation when client state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, flagId, defaultValue, lastUpdated]);
}
