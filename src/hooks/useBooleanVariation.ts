import { useBooleanVariationDetails } from './useBooleanVariationDetails';

// use useBooleanVariationDetails under the hood
export function useBooleanVariation(
  flagId: string,
  defaultValue: boolean
): boolean {
  const details = useBooleanVariationDetails(flagId, defaultValue);
  return details.variationValue;
}
