import { useContext, useMemo } from 'react';
import { BucketeerContext } from '../context';

// Should return BKTClient or null
export function useBucketeerClient() {
  const { client } = useContext(BucketeerContext);
  return useMemo(() => client, [client]);
}
