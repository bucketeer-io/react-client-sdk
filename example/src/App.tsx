import {
  useBooleanVariation,
  useStringVariation,
  useNumberVariation,
  useObjectVariation,
  defineBKTUser,
  defineBKTConfigForReact,
  BucketeerProvider,
} from 'bkt-react-client-sdk';
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
  const config = useObjectVariation('app-config', {
    enable_logging: true,
    guest_mode: false,
  });

  return (
    <div style={{ marginTop: 32, fontSize: 18 }}>
      <div>
        <strong>Boolean flag:</strong>{' '}
        {showNewText
          ? '🎉 The new feature is enabled!'
          : 'The new feature is disabled.'}
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
  // const [client, setClient] = useState<BKTClient | null>(null);
  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       await initializeBKTClient(bucketeerConfig, user);
  //     } catch (error) {
  //       if (error instanceof Error && error.name === 'TimeoutException') {
  //         // TimeoutException but The BKTClient SDK has been initialized
  //         console.warn(
  //           'Bucketeer client initialization timed out, but client is already initialized.'
  //         );
  //       } else {
  //         console.error('Failed to initialize Bucketeer client:', error);
  //         return; // Exit early for non-timeout errors
  //       }
  //     }
  //     try {
  //       const bktClient = getBKTClient()!;
  //       setClient(bktClient);
  //     } catch (error) {
  //       console.error('Failed to initialize Bucketeer client:', error);
  //     }
  //   };

  //   init();

  //   // Cleanup listener on unmount
  //   return () => {
  //     destroyBKTClient();
  //   };
  // }, []);
  return (
    // <BucketeerProvider2 client={client}>
    //   <h1>Bucketeer React SDK Demo</h1>
    //   <FeatureFlagDemo />
    // </BucketeerProvider2>
    <BucketeerProvider config={bucketeerConfig} user={user}>

        <h1>Bucketeer React SDK Demo</h1>
        <FeatureFlagDemo />
      </BucketeerProvider>
  );
}

export default App;
