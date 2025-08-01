import { useStringVariationDetails } from './useStringVariationDetails';

// use useStringVariationDetails under the hood
export function useStringVariation(
  flagId: string,
  defaultValue: string
): string {
  const details = useStringVariationDetails(flagId, defaultValue);
  return details.variationValue;
}
