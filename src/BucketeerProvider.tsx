import React, { useState, useEffect, type JSX, useContext } from 'react';
import {
  initializeBKTClient,
  getBKTClient,
  destroyBKTClient,
} from 'bkt-js-client-sdk';
import type { BKTClient, BKTUser, BKTConfig } from 'bkt-js-client-sdk';
import { BucketeerContext } from './context';
import { SOURCE_ID_REACT, SOURCE_ID_REACT_NATIVE } from './SourceId';

async function initializeBKTClientForReact(
  config: BKTConfig,
  user: BKTUser
): Promise<void> {
  if (
    config.wrapperSdkSourceId === SOURCE_ID_REACT_NATIVE ||
    config.wrapperSdkSourceId === SOURCE_ID_REACT
  ) {
    await initializeBKTClient(config, user);
  } else {
    throw new Error('SourceId is not supported');
  }
}

interface BucketeerProviderProps {
  config: BKTConfig;
  user: BKTUser;
  children?: React.ReactNode;
}

export function BucketeerProvider({
  config,
  user,
  children,
}: BucketeerProviderProps): JSX.Element {
  const shouldBeNullContext = useContext(BucketeerContext);
  if (shouldBeNullContext.client) {
    throw new Error(
      'Nested BucketeerProvider is not supported. BucketeerProvider should not be used inside another BucketeerProvider'
    );
  }

  const [client, setClient] = useState<BKTClient | null>(null);
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    let listenToken: string | null = null;
    let bktClient: BKTClient | null = null;

    const init = async () => {
      try {
        destroyBKTClient();
        await initializeBKTClientForReact(config, user);
      } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutException') {
          // TimeoutException but The BKTClient SDK has been initialized
          console.warn(
            'Bucketeer client initialization timed out, but client is already initialized.'
          );
        } else {
          console.error('Failed to initialize Bucketeer client:', error);
          return; // Exit early for non-timeout errors
        }
      }
      try {
        bktClient = getBKTClient()!;
        // Add listener to update timestamp on flag changes
        const listener = () => {
          setLastUpdated(Date.now());
        };
        listenToken = bktClient.addEvaluationUpdateListener(listener);
        setClient(bktClient);
        setLastUpdated(Date.now());
      } catch (error) {
        console.error('Failed to initialize Bucketeer client:', error);
      }
    };

    init();

    // Cleanup listener on unmount
    return () => {
      if (listenToken && bktClient) {
        bktClient.removeEvaluationUpdateListener(listenToken);
      }
    };
  }, [config, user]);

  return (
    <BucketeerContext.Provider value={{ client, lastUpdated }}>
      {children}
    </BucketeerContext.Provider>
  );
}

interface BucketeerProvider2Props {
  client: BKTClient | null;
  children?: React.ReactNode;
}

export function BucketeerProvider2({
  client,
  children,
}: BucketeerProvider2Props): JSX.Element {
  // Use initClient directly instead of storing in state since it's passed as prop
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    if (!client) {
      console.error('BucketeerProvider2: initClient is required');
      return;
    }

    let listenToken: string | null = null;

    const init = async () => {
      try {
        // Add listener to update timestamp on flag changes
        const listener = () => {
          setLastUpdated(Date.now());
        };
        listenToken = client.addEvaluationUpdateListener(listener);
        setLastUpdated(Date.now());
      } catch (error) {
        console.error('Failed to initialize Bucketeer client listener:', error);
      }
    };

    init();

    // Cleanup listener on unmount
    return () => {
      if (listenToken) {
        try {
          client.removeEvaluationUpdateListener(listenToken);
        } catch (error) {
          console.error('Failed to remove evaluation listener:', error);
        }
      }
    };
  }, [client]);

  return (
    <BucketeerContext.Provider value={{ client: client, lastUpdated }}>
      {children}
    </BucketeerContext.Provider>
  );
}
