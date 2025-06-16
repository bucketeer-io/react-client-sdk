import { BucketeerProvider, useBooleanVariation, useStringVariation, useNumberVariation, useObjectVariation, defineBKTUser, defineBKTConfigForReact } from '../../src';
import './App.css';

// Example Bucketeer config and user (replace with your real values)
const bucketeerConfig = defineBKTConfigForReact({
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
  // Boolean feature flag
  const showNewText = useBooleanVariation('show-new-text', false);
  // String feature flag
  const theme = useStringVariation('theme', 'light');
  // Number feature flag
  const maxItems = useNumberVariation('max-items-per-order', 10);
  // Object/JSON feature flag
  const config = useObjectVariation('app-config', { enable_logging: true, guest_mode: false });

  return (
    <div style={{ marginTop: 32, fontSize: 18 }}>
      <div>
        <strong>Boolean flag:</strong> {showNewText ? '🎉 The new feature is enabled!' : 'The new feature is disabled.'}
      </div>
      <div>
        <strong>String flag (theme):</strong> {theme}
      </div>
      <div>
        <strong>Number flag (max items):</strong> {maxItems}
      </div>
      <div>
        <strong>Object flag (config):</strong> {JSON.stringify(config)}
      </div>
    </div>
  );
}

function App() {
  return (
    <BucketeerProvider config={bucketeerConfig} user={user}>
      <h1>Bucketeer React SDK Demo</h1>
      <FeatureFlagDemo />
    </BucketeerProvider>
  );
}

export default App;
