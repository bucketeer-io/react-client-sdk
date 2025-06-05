# @bucketeer/react-client-sdk

A React SDK for Bucketeer feature flags, providing React hooks and components for easy integration.

## Installation

```sh
npm install @bucketeer/react-client-sdk
```

## Usage

### Basic Setup

Wrap your app with the `BucketeerProvider`:

```tsx
import React from 'react';
import { BucketeerProvider } from '@bucketeer/react-client-sdk';
import { defineBKTConfig, defineBKTUser } from 'bkt-js-client-sdk';

const config = defineBKTConfig({
  apiKey: 'your-api-key',
  apiEndpoint: 'https://api.bucketeer.io',
  appVersion: '1.0.0',
  featureTag: 'mobile',
});

const user = defineBKTUser({
  id: 'user-123',
  attributes: {
    platform: 'ios',
    version: '1.0.0',
  },
});

export default function App() {
  return (
    <BucketeerProvider config={config} user={user}>
      <YourAppContent />
    </BucketeerProvider>
  );
}
```

### Using Feature Flag Hooks

```tsx
import React from 'react';
import {
  useBooleanVariation,
  useStringVariation,
  useNumberVariation,
  useObjectVariation,
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
      <div>Theme: {theme}</div>
      <div>Max items: {maxItems}</div>
      <div>Timeout: {config.timeout}ms</div>
      <button onClick={handleUpdateUser}>Update User</button>
    </div>
  );
}
```

## API Reference

### Components

#### `BucketeerProvider`

Provides Bucketeer context to child components.

**Props:**
- `config`: BKTConfig - Bucketeer configuration
- `user`: BKTUser - User information
- `children`: ReactNode - Child components

### Hooks

#### `useBooleanVariation(flagId, defaultValue)`

Returns a boolean feature flag value.

#### `useStringVariation(flagId, defaultValue)`

Returns a string feature flag value.

#### `useNumberVariation(flagId, defaultValue)`

Returns a number feature flag value.

#### `useObjectVariation<T>(flagId, defaultValue)`

Returns a JSON/object feature flag value with type safety. Uses the modern `objectVariation` API.

**Note:** The generic type `T` must extend `BKTValue` (which includes objects, arrays, and primitive values).

#### `useBucketeerClient()`

Returns the Bucketeer client instance and utility functions.

Returns:
- `client`: BKTClient | null - The Bucketeer client instance
- `updateUserAttributes`: Function to update user attributes

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

Apache 2.0
