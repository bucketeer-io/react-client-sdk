# React Bucketeer SDK Overview

## What is it?

The **React Bucketeer SDK** is a React wrapper library that provides React hooks and components for seamless integration with [Bucketeer](https://bucketeer.io), a powerful feature flag management platform. It enables developers to easily implement feature flags, A/B testing, and configuration management in React applications with a declarative, React-friendly API.

## How it works

### Architecture

The SDK follows React's context pattern and hooks architecture:

```
┌─────────────────────────┐
│   BucketeerProvider     │  ← Initializes client & provides context
│                         │
├─────────────────────────┤
│   BucketeerContext      │  ← Shares client state across components
│                         │
├─────────────────────────┤
│   React Hooks           │  ← Type-safe feature flag hooks
│   • useBooleanVariation │
│   • useStringVariation  │
│   • useNumberVariation  │
│   • useObjectVariation  │
│   • ...  │
└─────────────────────────┘
```

### Key Components

1. **BucketeerProvider**: Context provider that initializes and manages the Bucketeer client
2. **Feature Flag Hooks**: Type-safe hooks for different data types
3. **Automatic Updates**: Real-time listener system for flag changes
4. **Client Access**: Direct client access for advanced operations

### Usage Flow

```tsx
// 1. Wrap your app with the provider
<BucketeerProvider config={config} user={user}>
  <App />
</BucketeerProvider>

// 2. Use hooks in any component
function MyComponent() {
  const showFeature = useBooleanVariation('new-feature', false);
  const theme = useStringVariation('app-theme', 'light');
  const config = useObjectVariation('app-config', { timeout: 5000 });
  
  return (
    <div>
      {showFeature && <NewFeature />}
      <span>Theme: {theme}</span>
    </div>
  );
}
```

## Why it helps developers ensure feature flags always update

### 🔄 **Automatic Real-time Updates**

The SDK implements an event-driven architecture that ensures feature flags are always synchronized:

```tsx
// When a flag changes on the server, components automatically re-render
const isEnabled = useBooleanVariation('premium-feature', false);
// ↑ This value updates automatically when changed remotely
```

**How it works:**
- The `BucketeerProvider` establishes an event listener with the Bucketeer client
- When flags change, the `lastUpdated` timestamp is automatically updated
- All hooks depend on `lastUpdated`, triggering React re-renders
- However, React's built-in optimization prevents actual DOM updates when flag values remain unchanged
- Components receive fresh flag values without manual intervention

### 🎯 **React's Declarative Updates**

Unlike imperative APIs, the hooks integrate with React's rendering cycle:

```tsx
// ❌ Imperative approach (prone to stale data)
useEffect(() => {
  const value = client.booleanVariation('feature');
  setFeature(value);
}, []); // Might miss updates

// ✅ Declarative approach (always fresh)
function ComponentA() {
  const feature = useBooleanVariation('feature', false);
  return <div>{feature && 'Feature'}</div>; // ✅ DOM updates
}
// Automatically updates when flag changes
```

### 🛡️ **Type Safety & Default Values**

Type-safe hooks prevent runtime errors and ensure graceful degradation:

```tsx
// Type-safe with automatic fallbacks
const maxItems = useNumberVariation('max-items', 10); // Always a number
const config = useObjectVariation('settings', { theme: 'dark' }); // Type-checked
```

### 🔄 **Re-rendering Behavior**

The SDK uses a simple approach that relies on React's built-in optimizations:

```tsx
// When ANY flag changes on the server:
// 1. All components using hooks will re-render (React lifecycle)
// 2. But React optimizes away actual DOM updates for unchanged values

function ComponentA() {
  const featureA = useBooleanVariation('feature-a', false); // Changed: true → false
  return <div>{featureA && 'Feature A'}</div>; // ✅ DOM updates
}

function ComponentB() {
  const featureB = useBooleanVariation('feature-b', false); // Unchanged: false → false  
  return <div>{featureB && 'Feature B'}</div>; // ✅ No DOM update (React optimization)
}
```

**Why this simple approach works well:**
- **Simplicity**: No complex flag tracking or selective subscriptions
- **Reliability**: Never miss flag updates due to subscription bugs
- **Performance**: React's `useState` optimization prevents unnecessary DOM updates
- **Consistency**: All components stay synchronized automatically

### ⚡ **Performance Optimized**

- **Single Context**: Shared client instance across all components
- **React-Optimized Re-renders**: Components re-render when flags change, but React's built-in optimization prevents unnecessary updates when flag values remain the same
- **Efficient Caching**: Client handles caching and network optimization
- **Minimal Bundle**: Lightweight wrapper around the core SDK

### 🔧 **Developer Experience**

```tsx
// Simple, intuitive API
function FeatureComponent() {
  const { client } = useContext(BucketeerContext);
  const showPremium = useBooleanVariation('premium-ui', false);
  
  const handleUpgrade = () => {
    client.updateUserAttributes({ plan: 'premium' });
    // Flags automatically update based on new user attributes
  };
  
  return showPremium ? <PremiumUI /> : <StandardUI />;
}
```

### 🚀 **Key Benefits for Flag Management**

1. **No Manual Polling**: Automatic updates via event listeners
2. **React Integration**: Seamless integration with React lifecycle
3. **Type Safety**: Compile-time checks prevent flag-related bugs
4. **Default Fallbacks**: Graceful handling of network issues or missing flags
5. **Real-time Sync**: Instant updates when flags change server-side
6. **Performance**: Optimized re-rendering and caching strategies

## Use Cases

- **Feature Rollouts**: Gradually enable new features
- **A/B Testing**: Test different UI variants or algorithms
- **Configuration Management**: Dynamic app configuration
- **Emergency Switches**: Quick feature disabling in production
- **User Segmentation**: Different experiences for user groups
- **Development Workflows**: Environment-specific feature enabling

## Summary

The React Bucketeer SDK transforms feature flag management from a manual, error-prone process into an automatic, type-safe, and React-native experience. By leveraging React's declarative paradigm and automatic re-rendering, developers can trust that their feature flags are always up-to-date without writing complex update logic or worrying about stale data.
