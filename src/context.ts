import React from 'react';
import type { BKTClient } from 'bkt-js-client-sdk';

interface BucketeerContextType {
  client: BKTClient | null;
  lastUpdated: number;
}

const BucketeerContext = React.createContext<BucketeerContextType>({
  client: null,
  lastUpdated: 0,
});

const { Provider, Consumer } = BucketeerContext;

export { Provider, Consumer, BucketeerContext };
export type { BucketeerContextType };
