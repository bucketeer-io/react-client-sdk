import { useContext, useState, useEffect } from 'react';
import type { BKTValue } from 'bkt-js-client-sdk';
import { BucketeerContext } from './context';

export function useBooleanVariation(
  flagId: string,
  defaultValue: boolean
): boolean {
  const { client, lastUpdated } = useContext(BucketeerContext);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (client) {
      const variation = client.booleanVariation(flagId, defaultValue);
      setValue(variation !== undefined ? variation : defaultValue);
    }
  }, [client, flagId, defaultValue, lastUpdated]);

  return client ? value : defaultValue;
}

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

export function useBucketeerClient() {
  const { client } = useContext(BucketeerContext);

  const updateUserAttributes = (attributes: Record<string, string>) => {
    if (client) {
      client.updateUserAttributes(attributes);
    }
  };

  return {
    client,
    updateUserAttributes,
  };
}
