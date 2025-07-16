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
import { StringEvaluations } from './components/StringEvaluations';
import { NumberEvaluations } from './components/NumberEvaluations';
import { BoolEvaluations } from './components/BoolEvaluations';
import { ObjectEvaluations } from './components/ObjectEvaluations';

// Example Bucketeer config and user (replace with your real values)
const bucketeerConfig = defineBKTConfigForReact({
  apiKey: import.meta.env.VITE_BUCKETEER_API_KEY,
  apiEndpoint: import.meta.env.VITE_BUCKETEER_API_ENDPOINT,
  appVersion: '1.0.0',
  featureTag: 'web',
});
const user = defineBKTUser({
  id: 'example-user',
  customAttributes: {
    platform: 'web',
    version: '1.0.0',
  },
});

function App() {
  const [client, setClient] = useState<BKTClient | null>(null);
  const [page, setPage] = useState<'string' | 'number' | 'bool' | 'object'>('string');

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
      <div style={{ marginBottom: 24 }}>
        <button
          data-testid="nav-string"
          onClick={() => setPage('string')}
          style={{ marginRight: 8, fontWeight: page === 'string' ? 'bold' : undefined }}
        >
          String Demo
        </button>
        <button
          data-testid="nav-number"
          onClick={() => setPage('number')}
          style={{ marginRight: 8, fontWeight: page === 'number' ? 'bold' : undefined }}
        >
          Number Demo
        </button>
        <button
          data-testid="nav-bool"
          onClick={() => setPage('bool')}
          style={{ marginRight: 8, fontWeight: page === 'bool' ? 'bold' : undefined }}
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
      {page === 'string' && <StringEvaluations />}
      {page === 'number' && <NumberEvaluations />}
      {page === 'bool' && <BoolEvaluations />}
      {page === 'object' && <ObjectEvaluations />}
    </BucketeerProvider>
  );
}

export default App;
