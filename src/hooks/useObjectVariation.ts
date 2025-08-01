import type { BKTValue } from '@bucketeer/js-client-sdk';
import { useObjectVariationDetails } from './useObjectVariationDetails';

export function useObjectVariation<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): T {
  const details = useObjectVariationDetails(flagId, defaultValue);
  return details.variationValue;
}
