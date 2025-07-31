import { useContext, useMemo, useRef } from 'react';
import { BucketeerContext } from '../context';
import type { BKTEvaluationDetails, BKTValue } from '@bucketeer/js-client-sdk';

// Deep equality check for BKTValue (non-recursive)
function deepEqualBKTValue(a: BKTValue, b: BKTValue): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // Use a stack to avoid recursion
  const stack: Array<[BKTValue, BKTValue]> = [[a, b]];

  while (stack.length > 0) {
    const [currentA, currentB] = stack.pop()!;

    if (currentA === currentB) continue;
    if (currentA == null || currentB == null) return false;
    if (typeof currentA !== typeof currentB) return false;
    if (typeof currentA !== 'object' || typeof currentB !== 'object')
      return false;

    const aIsArray = Array.isArray(currentA);
    const bIsArray = Array.isArray(currentB);
    if (aIsArray !== bIsArray) return false;

    if (aIsArray) {
      // Both are arrays
      const arrA = currentA as BKTValue[];
      const arrB = currentB as BKTValue[];
      if (arrA.length !== arrB.length) return false;

      for (let i = 0; i < arrA.length; i++) {
        stack.push([arrA[i], arrB[i]]);
      }
    } else {
      // Both are objects
      const keysA = Object.keys(currentA);
      const keysB = Object.keys(currentB);
      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!(key in currentB)) return false;
        stack.push([
          (currentA as Record<string, BKTValue>)[key],
          (currentB as Record<string, BKTValue>)[key],
        ]);
      }
    }
  }

  return true;
}

function useObjectVariationDetails<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): BKTEvaluationDetails<T> {
  const { client, lastUpdated } = useContext(BucketeerContext);

  // Use ref to store the previous value and only update if content actually changes
  const previousDefaultValue = useRef<T>(defaultValue);
  const stableDefaultValue = useMemo(() => {
    if (deepEqualBKTValue(defaultValue, previousDefaultValue.current)) {
      return previousDefaultValue.current;
    }
    previousDefaultValue.current = defaultValue;
    return defaultValue;
  }, [defaultValue]);

  return useMemo(() => {
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
    // lastUpdated is intentionally unused but needed in dependency array
    // to trigger re-evaluation when client state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, flagId, stableDefaultValue, lastUpdated]);
}

export { useObjectVariationDetails, deepEqualBKTValue };
