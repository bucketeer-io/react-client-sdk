# @bucketeer/react-client-sdk

A React SDK for Bucketeer feature flags, providing React hooks and components for easy integration. Built on top of the `bkt-js-client-sdk`.

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

or with yarn:

```bash
yarn add @bucketeer/react-client-sdk
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
  customAttributes: {
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

#### `useBucketeerClient()`

Returns the Bucketeer client instance and utility functions.

**Returns:**
- `client`: BKTClient | null - The Bucketeer client instance
- `updateUserAttributes`: Function to update user attributes

## Re-exported Types

The following types are re-exported from `bkt-js-client-sdk` for convenience:

- `BKTConfig` - Bucketeer configuration object
- `BKTUser` - User information object
- `BKTClient` - Bucketeer client instance
- `BKTValue` - Valid feature flag value types
- `defineBKTConfig` - Helper to create configuration
- `defineBKTUser` - Helper to create user objects

## Running the Example

To see the SDK in action, you can run the included example:

```bash
# Build the SDK
yarn build

# Start the example app
yarn example:start
```

The example will be available at `http://localhost:3000`.

## Development

### 🛠️ VS Code Setup (Yarn PnP)

This project uses **Yarn 4.x with PnP (Plug'n'Play)** for better performance and reliability. VS Code requires special configuration to work properly with PnP.

#### **Why Yarn PnP?**

**🚀 Key Benefits:**
- **Faster installs**: 5-15s vs 30-60s (no file copying, just resolution maps)
- **Disk space efficient**: Dependencies shared globally across projects
- **Stricter dependencies**: Prevents phantom dependency bugs
- **Faster CI/CD**: Dramatically reduces build times
- **Better performance**: Direct module resolution vs directory tree walking
- **Cleaner repos**: No massive `node_modules` directories

#### **IDE Setup (Required for IntelliSense)**

If you see these issues in your editor:
- ❌ "Cannot find module 'bkt-js-client-sdk'" errors
- ❌ "Cannot find name 'describe', 'it', 'expect'" in test files
- ❌ Missing auto-imports and IntelliSense

#### **VS Code Setup**

1. **Install the ZipFS extension** (maintained by Yarn team):
   ```
   Extension ID: arcanis.vscode-zipfs
   ```

2. **Generate VS Code SDK configuration**:
   ```bash
   yarn dlx @yarnpkg/sdks vscode
   ```

3. **Activate workspace TypeScript** (required for safety):
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) in any TypeScript file
   - Choose "Select TypeScript Version"
   - Pick "Use Workspace Version"

4. **Restart VS Code completely**

#### **Other IDEs**

For **WebStorm**, **Vim**, **Neovim**, **Emacs**, and other editors:

```bash
# Generate SDKs for your specific editor
yarn dlx @yarnpkg/sdks vim
yarn dlx @yarnpkg/sdks base  # For generic editors
```

✅ **After setup**: Full IntelliSense, auto-imports, and dependency resolution should work perfectly.

**📚 Complete Setup Guide**: [Yarn Editor SDKs Documentation](https://yarnpkg.com/getting-started/editor-sdks#editor-setup)

### Setup

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Build the library
yarn build

# Lint code
yarn lint

# Format code
yarn format

# Type check
yarn type-check
```

### Scripts

- `yarn build` - Build the library for production
- `yarn dev` - Build in watch mode
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Lint and fix code
- `yarn lint:check` - Check linting without fixing
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check formatting without fixing
- `yarn type-check` - Run TypeScript type checking

## Dependencies

This library uses the [bkt-js-client-sdk](https://www.npmjs.com/package/bkt-js-client-sdk) under the hood.

## License

Apache