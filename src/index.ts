// Export React components and hooks
export { BucketeerProvider } from './BucketeerProvider';
export { BucketeerContext } from './context';
export type { BucketeerContextType } from './context';
export {
  useBooleanVariation,
  useBooleanVariationDetails,
  useStringVariation,
  useStringVariationDetails,
  useNumberVariation,
  useNumberVariationDetails,
  useObjectVariation,
  useObjectVariationDetails,
  useBucketeerClient,
} from './hooks/index';

// Re-export types from bkt-js-client-sdk for convenience
export * from 'bkt-js-client-sdk';

// Simple hello function
export const hello = (): string => {
  return 'Hello from Bucketeer React Client SDK!';
};
