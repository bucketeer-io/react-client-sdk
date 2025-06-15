import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';
import { BKTEvaluationDetails } from 'bkt-js-client-sdk';

// export function useBooleanVariation(
//   flagId: string,
//   defaultValue: boolean
// ): boolean {
//   const { client, lastUpdated } = useContext(BucketeerContext);
//   const [value, setValue] = useState(defaultValue);

//   useEffect(() => {
//     if (client) {
//       const variation = client.booleanVariation(flagId, defaultValue);
//       setValue(variation !== undefined ? variation : defaultValue);
//     }
//   }, [client, flagId, defaultValue, lastUpdated]);

//   return client ? value : defaultValue;
// }

export function useBooleanVariation(
  flagId: string,
  defaultValue: boolean
): boolean {
  const { client, lastUpdated } = useContext(BucketeerContext);

  return useMemo(() => {
    // Keep reference to the client and lastUpdated to trigger re-evaluation
    // when they change, ensuring the hook is reactive to updates.
    if (client && lastUpdated !== undefined) {
      const variation = client.booleanVariation(flagId, defaultValue);
      return variation !== undefined ? variation : defaultValue;
    }
    return defaultValue;
  }, [client, flagId, defaultValue, lastUpdated]);
}

export function useBooleanVariationDetails(
  flagId: string,
  defaultValue: boolean
): BKTEvaluationDetails<boolean> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  // `useMemo` will only recompute the memoized value when one of the `deps` has changed.
  // Keep useMemo version — it’s simpler, correct, and idiomatic as long as
  // the booleanVariationDetails method is pure and sync.
  return useMemo(() => {
    if (client && lastUpdated !== undefined) {
      return client.booleanVariationDetails(flagId, defaultValue);
    }
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
