# Bucketeer React SDK for Web Clients

This SDK enables seamless access to your feature flags in React applications using [Bucketeer](https://bucketeer.io/). It provides React hooks and components for easy integration, and is built on top of the robust `@bucketeer/js-client-sdk`.

[Bucketeer](https://bucketeer.io) is an open-source platform created by [CyberAgent](https://www.cyberagent.co.jp/en/) to help teams make better decisions, reduce deployment lead time and release risk through feature flags. Bucketeer offers advanced features like dark launches and staged rollouts that perform limited releases based on user attributes, devices, and other segments.

> [!WARNING]
> This is a beta version. Breaking changes may be introduced before general release.

For documentation related to flags management in Bucketeer, refer to the [Bucketeer documentation website](https://docs.bucketeer.io/sdk/client-side/javascript).


## Features

- 🚀 React Context and Hooks for easy integration
- 🔧 TypeScript support with full type safety
- ⚡ Real-time feature flag updates
- 🎯 Multiple variation types (boolean, string, number, object)
- 🧪 User attribute management
- 📦 Tree-shakeable and lightweight

## Installation
```bash
npm install @bucketeer/react-client-sdk
```

> Required React version is `^16.8.0` or later, as it uses React Hooks. React DOM version should match the React version.

## Usage

### Initialization

Initialize the Bucketeer client and provide it to your app using the `BucketeerProvider`:

> Use `defineBKTConfigForReact` to create your config and `defineBKTUser` to create a user and initializing the client using `initializeBKTClient`

```tsx
import React, { useEffect, useState } from 'react';
import {
  BucketeerProvider,
  defineBKTConfigForReact,
  defineBKTUser,
  initializeBKTClient,
  getBKTClient,
  destroyBKTClient,
  type BKTClient,
} from '@bucketeer/react-client-sdk';

const config = defineBKTConfigForReact({
  apiKey: 'your-api-key',
  apiEndpoint: 'https://api.bucketeer.io',
  appVersion: '1.0.0',
  featureTag: 'web',
});

const user = defineBKTUser({
  id: 'user-123',
  customAttributes: {
    platform: 'ios',
    version: '1.0.0',
  },
});

export default function App() {
  const [client, setClient] = useState<BKTClient | null>(null);
  useEffect(() => {
    const init = async () => {
      try {
        await initializeBKTClient(config, user);
      } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutException') {
          // TimeoutException but The BKTClient SDK has been initialized
          console.warn('Bucketeer client initialization timed out, but client is already initialized.');
        } else {
          console.error('Failed to initialize Bucketeer client:', error);
          return;
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
    return () => {
      destroyBKTClient();
    };
  }, []);
  if (!client) {
    return <div>Loading Bucketeer client...</div>;
  }
  return (
    <BucketeerProvider client={client}>
      <YourAppContent />
    </BucketeerProvider>
  );
}
```

> If you see a `TimeoutException` error during initialization, it means the Bucketeer client has already been initialized successfully. This error is safe to ignore and does not affect the client’s functionality.

### Using Feature Flag Hooks

```tsx
import React from 'react';
import {
  useBooleanVariation,
  useStringVariation,
  useNumberVariation,
  useObjectVariation,
  useBooleanVariationDetails,
  useStringVariationDetails,
  useNumberVariationDetails,
  useObjectVariationDetails,
  useBucketeerClient,
} from '@bucketeer/react-client-sdk';

function MyComponent() {
  // Boolean feature flag
  const showNewFeature = useBooleanVariation('show-new-feature', false);
  // String feature flag
  const theme = useStringVariation('app-theme', 'light');
  // Number feature flag
  const maxItems = useNumberVariation('max-items', 10);
  // JSON feature flag
  const config = useObjectVariation('app-config', { timeout: 5000 });
  // Feature flag with detailed evaluation information
  const featureDetails = useBooleanVariationDetails('advanced-feature', false);
  // Access client for advanced operations
  const { client, updateUserAttributes } = useBucketeerClient();
  const handleUpdateUser = () => {
    updateUserAttributes({
      plan: 'premium',
      region: 'us-west',
    });
  };
  return (
    <div>
      {showNewFeature && <NewFeature />}
      {featureDetails.variationValue && <AdvancedFeature />}
      <div>Theme: {theme}</div>
      <div>Max items: {maxItems}</div>
      <div>Timeout: {config.timeout}ms</div>
      <div>Feature reason: {featureDetails.reason}</div>
      <button onClick={handleUpdateUser}>Update User</button>
    </div>
  );
}
```

## API Reference

### Components

#### `BucketeerProvider`

Provides Bucketeer context to child components. Most users should use the provided hooks for feature flag access; direct context access is for advanced use cases.

**Props:**
- `client`: BKTClient - Bucketeer client instance
- `children`: ReactNode - Child components

```tsx
<BucketeerProvider client={client}>
  {/* Your app content here */}
  <YourAppContent />
</BucketeerProvider>
```

Inside your components, you can access the Bucketeer client and last updated time using the `useContext` hook:

```tsx
import { useContext } from 'react';
import { BucketeerContext } from '@bucketeer/react-client-sdk';
const { client, lastUpdated } = useContext(BucketeerContext);
```

### Hooks

#### `useBooleanVariation(flagId, defaultValue)`

Returns a boolean feature flag value.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: boolean - Default value if flag is not available

**Returns:** boolean

#### `useStringVariation(flagId, defaultValue)`

Returns a string feature flag value.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: string - Default value if flag is not available

**Returns:** string

#### `useNumberVariation(flagId, defaultValue)`

Returns a number feature flag value.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: number - Default value if flag is not available

**Returns:** number

#### `useObjectVariation<T>(flagId, defaultValue)`

Returns a JSON/object feature flag value with type safety. Uses the modern `objectVariation` API.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: T - Default value if flag is not available

**Returns:** T

**Note:** The generic type `T` must extend `BKTValue` (which includes objects, arrays, and primitive values).

#### `useBooleanVariationDetails(flagId, defaultValue)`

Returns a boolean feature flag value along with detailed evaluation information.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: boolean - Default value if flag is not available

**Returns:** `BKTEvaluationDetails<boolean>` - Object containing:
- `variationValue`: boolean - The feature flag value
- `featureId`: string - The feature flag identifier
- `featureVersion`: number - Version of the feature flag
- `userId`: string - User ID used for evaluation
- `variationId`: string - ID of the variation returned
- `variationName`: string - Name of the variation
- `reason`: string - Reason for the evaluation result

#### `useStringVariationDetails(flagId, defaultValue)`

Returns a string feature flag value along with detailed evaluation information.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: string - Default value if flag is not available

**Returns:** `BKTEvaluationDetails<string>`

#### `useNumberVariationDetails(flagId, defaultValue)`

Returns a number feature flag value along with detailed evaluation information.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: number - Default value if flag is not available

**Returns:** `BKTEvaluationDetails<number>`

#### `useObjectVariationDetails<T>(flagId, defaultValue)`

Returns a JSON/object feature flag value along with detailed evaluation information.

**Parameters:**
- `flagId`: string - The feature flag identifier
- `defaultValue`: T - Default value if flag is not available

**Returns:** `BKTEvaluationDetails<T>`

**Note:** The generic type `T` must extend `BKTValue`.

## Re-exported Types

The React SDK re-exports several types from the `bkt-js-client-sdk` for convenience. Examples include:

- `BKTConfig` - Bucketeer configuration object
- `BKTUser` - User information object
- `BKTClient` - Bucketeer client instance
- `BKTValue` - Valid feature flag value types
- `BKTEvaluationDetails<T>` - Detailed evaluation information for feature flags
- `defineBKTConfig` - Helper to create configuration
- `defineBKTUser` - Helper to create user objects

Without the `BucketeerContext`, you can still access the Bucketeer client using the JS SDK methods:
```tsx
import { getBKTClient } from '@bucketeer/react-client-sdk';
const client = getBKTClient();
```

For full JS API reference, see the [Bucketeer documentation website](https://docs.bucketeer.io/sdk/client-side/javascript).

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build the library
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

### Scripts

- `pnpm build` - Build the library for production
- `pnpm dev` - Build in watch mode
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Lint and fix code
- `pnpm lint:check` - Check linting without fixing
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without fixing
- `pnpm type-check` - Run TypeScript type checking

### Running the Example

To see the SDK in action, you can run the included example:

- Copy the `example/env_template` file to `example/.env` and update it with your Bucketeer credentials. Example:

```env
VITE_BUCKETEER_API_KEY=your-api-key
VITE_BUCKETEER_API_ENDPOINT=https://your-bucketeer-endpoint
```

- Build the SDK
```bash
pnpm build
```

- Start the example app
```bash
pnpm example:start
```

## Dependencies

This library uses the [bkt-js-client-sdk](https://www.npmjs.com/package/bkt-js-client-sdk) under the hood.

## License

Apache