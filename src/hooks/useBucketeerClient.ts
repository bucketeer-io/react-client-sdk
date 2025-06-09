import { useContext } from 'react';
import { BucketeerContext } from '../context';

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
