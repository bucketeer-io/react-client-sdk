import { useContext, useState, useEffect } from 'react';
import { BucketeerContext } from '../context';

export function useNumberVariation(
  flagId: string,
  defaultValue: number
): number {
  const { client, lastUpdated } = useContext(BucketeerContext);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (client) {
      const variation = client.numberVariation(flagId, defaultValue);
      setValue(variation !== undefined ? variation : defaultValue);
    }
  }, [client, flagId, defaultValue, lastUpdated]);

  return client ? value : defaultValue;
}
