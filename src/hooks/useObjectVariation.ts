import { useContext, useState, useEffect } from 'react';
import type { BKTValue } from 'bkt-js-client-sdk';
import { BucketeerContext } from '../context';

export function useObjectVariation<T extends BKTValue>(
  flagId: string,
  defaultValue: T
): T {
  const { client, lastUpdated } = useContext(BucketeerContext);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (client) {
      const variation = client.objectVariation(flagId, defaultValue);
      setValue(variation !== undefined ? (variation as T) : defaultValue);
    }
  }, [client, flagId, defaultValue, lastUpdated]);

  return client ? value : defaultValue;
}
