import {
  defineBKTUser,
  defineBKTConfigForReact,
  BucketeerProvider,
  initializeBKTClient,
  type BKTClient,
  getBKTClient,
  destroyBKTClient,
} from 'bkt-react-client-sdk';
import './App.css';
import { useEffect, useState } from 'react';
import { StringVariation } from './components/StringVariation';
import { NumberIntVariation } from './components/NumberIntVariation';
import { NumberDoubleVariation } from './components/NumberDoubleVariation';
import { BoolVariation } from './components/BoolVariation';
import { ObjectVariation } from './components/ObjectVariation';
import { FEATURE_TAG, USER_ID } from './constants';

// Example Bucketeer config and user (replace with your real values)
const bucketeerConfig = defineBKTConfigForReact({
  apiKey: import.meta.env.VITE_BUCKETEER_API_KEY,
  apiEndpoint: import.meta.env.VITE_BUCKETEER_API_ENDPOINT,
  appVersion: '1.0.0',
  featureTag: FEATURE_TAG,
});
const user = defineBKTUser({
  id: USER_ID,
  customAttributes: {
    platform: 'web',
    version: '1.0.0',
  },
});

function App() {
  const [client, setClient] = useState<BKTClient | null>(null);
  const [page, setPage] = useState<
    'string' | 'number-int' | 'number-double' | 'bool' | 'object'
  >('string');

  useEffect(() => {
    const init = async () => {
      try {
        await initializeBKTClient(bucketeerConfig, user);
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
        const bktClient = getBKTClient()!;
        setClient(bktClient);
      } catch (error) {
        console.error('Failed to initialize Bucketeer client:', error);
      }
    };

    init();

    // Cleanup listener on unmount
    return () => {
      destroyBKTClient();
    };
  }, []);

  if (!client) {
    return (
      <>
        <h1>Bucketeer React SDK Demo</h1>
        <div className="loading-spinner"></div>
        <div>Loading Bucketeer client...</div>
      </>
    );
  }

  return (
    <BucketeerProvider client={client}>
      <h1>Bucketeer React SDK Demo</h1>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 8px', // 12px vertical, 8px horizontal gap
        }}
      >
        <button
          data-testid="nav-string"
          onClick={() => setPage('string')}
          style={{
            marginRight: 8,
            fontWeight: page === 'string' ? 'bold' : undefined,
          }}
        >
          String Demo
        </button>
        <button
          data-testid="nav-number-int"
          onClick={() => setPage('number-int')}
          style={{
            marginRight: 8,
            fontWeight: page === 'number-int' ? 'bold' : undefined,
          }}
        >
          Number Int Demo
        </button>
        <button
          data-testid="nav-number-double"
          onClick={() => setPage('number-double')}
          style={{
            marginRight: 8,
            fontWeight: page === 'number-double' ? 'bold' : undefined,
          }}
        >
          {' '}
          Number Double Demo
        </button>
        <button
          data-testid="nav-bool"
          onClick={() => setPage('bool')}
          style={{
            marginRight: 8,
            fontWeight: page === 'bool' ? 'bold' : undefined,
          }}
        >
          Bool Demo
        </button>
        <button
          data-testid="nav-object"
          onClick={() => setPage('object')}
          style={{ fontWeight: page === 'object' ? 'bold' : undefined }}
        >
          Object Demo
        </button>
      </div>
      {page === 'string' && <StringVariation />}
      {page === 'number-int' && <NumberIntVariation />}
      {page === 'number-double' && <NumberDoubleVariation />}
      {page === 'bool' && <BoolVariation />}
      {page === 'object' && <ObjectVariation />}
    </BucketeerProvider>
  );
}

export default App;
