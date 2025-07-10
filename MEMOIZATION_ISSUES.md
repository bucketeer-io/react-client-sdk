# Memoization Issues & Fix in useObjectVariationDetails hook

## Problem
Object literals in React hooks create new references on every render, causing unnecessary re-computations:

```tsx
// ❌ Bad: New object every render
useObjectVariationDetails('flag', { timeout: 5000, retries: 3 });
```

## Impact
- Unnecessary API calls to BKT client
- Performance degradation
- Memory pressure

## Solution Applied
Fixed `useObjectVariationDetails` with deep equality memoization:

```tsx
// Deep equality check for defaultValue
const memoizedDefaultValue = useMemo(() => defaultValue, [
  JSON.stringify(defaultValue)
]);
```

## Usage Best Practices

```tsx
// ✅ Good: Stable reference
const DEFAULT_CONFIG = { timeout: 5000, retries: 3 };
useObjectVariationDetails('flag', DEFAULT_CONFIG);

// ✅ Good: Memoized
const config = useMemo(() => ({ timeout: 5000, retries: 3 }), []);
useObjectVariationDetails('flag', config);
```

## Test Coverage
Added memoization tests to verify:
- Same object content doesn't trigger multiple client calls
- Different content properly triggers re-evaluation
- Stable references returned for identical content
