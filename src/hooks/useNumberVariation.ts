import { useNumberVariationDetails } from './useNumberVariationDetails';

// use useNumberVariationDetails under the hood
export function useNumberVariation(
  flagId: string,
  defaultValue: number
): number {
  const details = useNumberVariationDetails(flagId, defaultValue);
  return details.variationValue;
}
