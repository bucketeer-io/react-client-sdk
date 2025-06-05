import { BucketeerProvider, useBooleanVariation, defineBKTConfig, defineBKTUser } from '../../src';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

// Example Bucketeer config and user (replace with your real values)
const bucketeerConfig = defineBKTConfig({
  apiKey: 'your-api-key', // TODO: Replace with your Bucketeer API key
  apiEndpoint: 'https://your-bucketeer-endpoint', // TODO: Replace with your Bucketeer endpoint
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

function FeatureFlagDemo() {
  // Use a boolean feature flag to toggle text
  const showNewText = useBooleanVariation('show-new-text', false);
  return (
    <div style={{ marginTop: 32, fontSize: 20 }}>
      {showNewText ? '🎉 The new feature is enabled!' : 'The new feature is disabled.'}
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <BucketeerProvider config={bucketeerConfig} user={user}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Bucketeer Example</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <FeatureFlagDemo />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </BucketeerProvider>
  )
}

export default App
