import { useContext, useMemo, useRef } from 'react';
import { BucketeerContext } from '../context';
import type { BKTEvaluationDetails, BKTValue } from '@bucketeer/js-client-sdk';

// Deep equality check for objects
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (keysB.indexOf(key) === -1) return false;
    if (
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}

export function useObjectVariationDetails<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): BKTEvaluationDetails<T> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  // Use ref to store the previous value and only update if content actually changes
  const previousDefaultValue = useRef<T>(defaultValue);
  const stableDefaultValue = useMemo(() => {
    if (deepEqual(defaultValue, previousDefaultValue.current)) {
      return previousDefaultValue.current;
    }
    previousDefaultValue.current = defaultValue;
    return defaultValue;
  }, [defaultValue]);

  return useMemo(() => {
    void lastUpdated; // Reference to satisfy ESLint

    if (client) {
      const result = client.objectVariationDetails(flagId, stableDefaultValue);
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
      variationValue: stableDefaultValue,
      reason: 'DEFAULT',
    } satisfies BKTEvaluationDetails<T>;
  }, [client, flagId, stableDefaultValue, lastUpdated]);
}
