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

## Working with the Rendered DOM in Hook Tests

When testing hooks in this SDK, we always render a test component and collect the **render output** from React Testing Library's `render` function (or our `setupAsync` helper).

> **What is this render output?**  
> React Testing Library creates a **virtual DOM container** when you call `render()`. The returned object provides query methods to interact with this DOM, which mirrors what users see in the browser.

**We only need to collect the render output once per test.**

### How it connects to the DOM

1. **React renders** your component into a DOM container managed by React Testing Library
2. **The render output object** provides methods like `getByTestId()` that query this DOM
3. **When React re-renders** (due to state/context changes), the DOM is updated automatically
4. **The same query methods** always return the current DOM elements - no need to re-query

### Example

```tsx
const renderResult = await setupAsync(<TestComponent />);
// renderResult.getByTestId() queries the actual DOM elements

// Initial DOM state
expect(renderResult.getByTestId('flag-value')).toHaveTextContent('{"foo":1}');

// Trigger React re-render
await act(async () => {
  const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
    .mock.calls[0][0];
  listener(); // This causes the component to re-render
});

// Same query method, but now returns the updated DOM element
expect(renderResult.getByTestId('flag-value')).toHaveTextContent('{"foo":2}');
```

**Key Point:**  
React Testing Library maintains a live connection between the render output and the actual DOM. When React updates the component, the DOM changes, and our queries automatically see the latest version.

## Related Documentation

- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Hooks - React Docs](https://reactjs.org/docs/hooks-faq.html#how-to-test-components-that-use-hooks)

