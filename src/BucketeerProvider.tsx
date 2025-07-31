import React, { useState, useEffect, type JSX, useMemo } from 'react';
import { initializeBKTClient } from '@bucketeer/js-client-sdk';
import type { BKTClient, BKTUser, BKTConfig } from '@bucketeer/js-client-sdk';
import { BucketeerContext } from './context';
import { SOURCE_ID_REACT, SOURCE_ID_REACT_NATIVE } from './SourceId';

export async function initializeBKTClientForReact(
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
  client: BKTClient | null;
  children?: React.ReactNode;
}

export function BucketeerProvider({
  client,
  children,
}: BucketeerProviderProps): JSX.Element {
  // Use initClient directly instead of storing in state since it's passed as prop
  const [lastUpdated, setLastUpdated] = useState(0);
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ client: client, lastUpdated }),
    [client, lastUpdated]
  );
  useEffect(() => {
    if (!client) {
      console.warn('BucketeerProvider: BKTClient is null or undefined');
      return;
    } else {
      console.info(
        'BucketeerProvider:  Initializing Bucketeer client listener'
      );
    }

    let listenToken: string | null = null;

    const init = async () => {
      try {
        // Add listener to update timestamp on flag changes
        const listener = () => {
          setLastUpdated(Date.now());
        };
        listenToken = client.addEvaluationUpdateListener(listener);
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
          console.info(
            `BucketeerProvider: Removed evaluation listener ${listenToken}`
          );
        } catch (error) {
          console.error('Failed to remove evaluation listener:', error);
        }
      }
    };
  }, [client]);

  return (
    <BucketeerContext.Provider value={contextValue}>
      {children}
    </BucketeerContext.Provider>
  );
}
