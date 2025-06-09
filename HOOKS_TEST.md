# React Hooks Testing Strategy

This document outlines the testing approach for React hooks in the Bucketeer React Client SDK, specifically for feature flag variation hooks.

## Overview

Our testing strategy focuses on testing hooks through React components rather than in isolation, following React testing best practices. We test user-facing behavior and integration with the React rendering cycle rather than implementation details.

## Testing Philosophy

### ✅ What We Test
- **User-facing behavior**: How hooks behave when used in real components
- **Integration with React**: Proper integration with React's rendering and state management
- **Feature flag updates**: How hooks respond to flag value changes
- **Error handling**: Fallback behavior when flags are missing or unavailable
- **Provider context**: Proper integration with `BucketeerProvider`

### ❌ What We Avoid
- **Implementation details**: Internal hook mechanics that users don't see
- **Isolated hook testing**: Testing hooks completely outside of React components
- **Mock internals**: Over-mocking of internal React behavior

## Test Structure

### Shared Test Utilities

We use shared utilities to eliminate code duplication and ensure consistency:

```typescript
// Mock creation utilities
function createMockConfig(): BKTConfig
function createMockUser(): BKTUser  
function createMockClient(variationMethod: string): BKTClient

// Main test setup
function setupTest(variationMethod: string)
```

### Test Suite Pattern

Each hook follows a consistent testing pattern:

```typescript
describe('useXxxVariation', () => {
  let mockClient: BKTClient;
  let setup: (children: React.ReactNode) => ReturnType<typeof render>;

  beforeEach(() => {
    // Reset all mocks
    jest.resetModules();
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Setup test environment
    const testSetup = setupTest('xxxVariation');
    mockClient = testSetup.mockClient;
    setup = testSetup.setup;
  });

  // Test cases...
});
```

## Test Cases

### 1. Flag Value Updates

**Purpose**: Verify that hooks properly respond to feature flag changes

**Two Approaches**:

#### Approach A: External Variable Capture (Current)
```typescript
let value = defaultValue;
function TestComponent() {
  value = useXxxVariation('flag', defaultValue);
  return null;
}
// Assert on captured value
expect(value).toBe(expectedValue);
```

#### Approach B: DOM-Based Testing (Recommended)
```typescript
function TestComponent() {
  const value = useXxxVariation('flag', defaultValue);
  return <div data-testid="flag-value">{value}</div>;
}
const { getByTestId } = setup(<TestComponent />);
expect(getByTestId('flag-value')).toHaveTextContent(expectedValue);
```

**Why B is Better**:
- Tests actual rendered output that users see
- Verifies integration with React's rendering cycle
- More resilient to implementation changes
- Follows React Testing Library principles

### 2. Default Value Fallback

**Purpose**: Ensure hooks return default values when flags are unavailable

```typescript
it('falls back to default if flag missing', async () => {
  (mockClient.xxxVariation as jest.Mock).mockReturnValue(undefined);
  
  // Test implementation with either approach
  expect(result).toBe(defaultValue);
});
```

### 3. Flag Update Simulation

**Purpose**: Test hooks respond to real-time flag changes

```typescript
// Simulate flag update by triggering the registered listener
await act(async () => {
  const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
    .mock.calls[0][0];
  listener();
});
```

## Mock Strategy

### BKT Client SDK Mocking

```typescript
jest.mock('bkt-js-client-sdk', () => {
  const actual = jest.requireActual('bkt-js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});
```

### Dynamic Mock Client Creation

Each test gets a fresh mock client with the appropriate variation method:

```typescript
function createMockClient(variationMethod: string): BKTClient {
  return {
    [variationMethod]: jest.fn(),
    addEvaluationUpdateListener: jest.fn().mockReturnValue('mock-listener-token'),
    removeEvaluationUpdateListener: jest.fn(),
    updateUserAttributes: jest.fn(),
  } as unknown as BKTClient;
}
```

## Best Practices

### 1. Test Setup
- Use `beforeEach` to reset all mocks and ensure test isolation
- Use shared utilities to reduce code duplication
- Create fresh mock instances for each test

### 2. Test Components
- Create minimal test components that use the hook
- Prefer rendering actual values over capturing to external variables
- Use `data-testid` for reliable element selection

### 3. Async Testing
- Wrap state changes in `act()` to ensure proper React updates
- Use `async/await` for asynchronous operations
- Wait for effects to complete before making assertions

### 4. Assertions
- Test user-visible behavior, not implementation details
- Use semantic assertions (`toHaveTextContent` vs `toBe`)
- Verify both initial state and state after updates

## Future Improvements

### 1. Move to DOM-Based Testing
Gradually migrate from external variable capture to DOM-based assertions:

```typescript
// Current (less ideal)
let value = false;
function TestComponent() {
  value = useBooleanVariation('flag', false);
  return null;
}
expect(value).toBe(true);

// Better
function TestComponent() {
  const value = useBooleanVariation('flag', false);
  return <div data-testid="flag-value">{String(value)}</div>;
}
expect(getByTestId('flag-value')).toHaveTextContent('true');
```

### 2. Integration Testing
Add tests that combine multiple hooks in realistic scenarios:

```typescript
function FeatureComponent() {
  const showFeature = useBooleanVariation('show-feature', false);
  const theme = useStringVariation('theme', 'light');
  const maxItems = useNumberVariation('max-items', 10);
  
  return (
    <div className={theme} data-testid="feature">
      {showFeature && <div data-testid="items-count">{maxItems}</div>}
    </div>
  );
}
```

### 3. Error Boundary Testing
Test hook behavior when the Bucketeer client encounters errors:

```typescript
it('handles client errors gracefully', async () => {
  (mockClient.booleanVariation as jest.Mock).mockImplementation(() => {
    throw new Error('Client error');
  });
  
  // Verify hook returns default value and doesn't crash
});
```

## Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component rendering and DOM queries
- **React Test Utils**: `act()` for handling React updates
- **TypeScript**: Type safety for test code

## File Organization

```
src/hooks/
├── hooks.test.tsx          # Main test file with shared utilities
├── useBooleanVariation.ts  # Hook implementation
├── useStringVariation.ts   # Hook implementation
├── useNumberVariation.ts   # Hook implementation
├── useObjectVariation.ts   # Hook implementation
└── index.ts               # Hook exports
```

## Related Documentation

- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Hooks - React Docs](https://reactjs.org/docs/hooks-faq.html#how-to-test-components-that-use-hooks)
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

---

*This document should be updated as testing practices evolve and improve.*
