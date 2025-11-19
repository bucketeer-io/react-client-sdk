import { useContext } from 'react';
import { BucketeerContext } from '../context';

// Should return BKTClient or null
export function useBucketeerClient() {
  const { client } = useContext(BucketeerContext);
  return client;
}
