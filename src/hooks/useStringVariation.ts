import { useContext, useState, useEffect } from 'react';
import { BucketeerContext } from '../context';

export function useStringVariation(
  flagId: string,
  defaultValue: string
): string {
  const { client, lastUpdated } = useContext(BucketeerContext);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (client) {
      const variation = client.stringVariation(flagId, defaultValue);
      setValue(variation !== undefined ? variation : defaultValue);
    }
  }, [client, flagId, defaultValue, lastUpdated]);

  return client ? value : defaultValue;
}
