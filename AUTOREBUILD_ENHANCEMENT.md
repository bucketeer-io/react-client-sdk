# useBooleanVariationDetails Hook Enhancement: updateOnFlagChanged Option

## Problem
The current `useBooleanVariationDetails` hook always rerenders when the `lastUpdated` context value changes. This may not be desired in all use cases where developers want to evaluate a feature flag only once and not react to subsequent updates.

## Solution
Add an optional `updateOnFlagChanged` parameter to control whether the hook should recompute when context updates occur.

## Implementation Details

### Interface Addition
```typescript
interface UseBooleanVariationDetailsOptions {
  updateOnFlagChanged?: boolean; // defaults to true for backward compatibility
}
```

### Hook Signature Update
```typescript
export function useBooleanVariationDetails(
  flagId: string,
  defaultValue: boolean,
  options: UseBooleanVariationDetailsOptions = {}
): BKTEvaluationDetails<boolean>
```

### Key Changes
1. **Conditional dependency array**: 
   - `updateOnFlagChanged: true` → `[client, flagId, defaultValue, lastUpdated]`
   - `updateOnFlagChanged: false` → `[client, flagId, defaultValue]` (excludes `lastUpdated`)

2. **Conditional ESLint void reference**: Only reference `lastUpdated` when `updateOnFlagChanged` is true

### Implementation Code
```typescript
const { updateOnFlagChanged = true } = options;

return useMemo(() => {
  if (updateOnFlagChanged) {
    void lastUpdated; // Reference to satisfy ESLint only when updateOnFlagChanged is true
  }

  // ... existing logic ...
}, updateOnFlagChanged ? [client, flagId, defaultValue, lastUpdated] : [client, flagId, defaultValue]);
```

## Usage Examples

```typescript
// Default behavior - rerenders on context updates
const details1 = useBooleanVariationDetails('flag1', false);

// Explicit updateOnFlagChanged - rerenders on context updates
const details2 = useBooleanVariationDetails('flag2', false, { updateOnFlagChanged: true });

// No update on flag changes - evaluates once, ignores context updates
const details3 = useBooleanVariationDetails('flag3', false, { updateOnFlagChanged: false });
```

## Benefits
- **Backward compatible**: Default behavior unchanged
- **Performance optimization**: Reduces unnecessary rerenders when `updateOnFlagChanged: false`
- **Developer control**: Allows fine-grained control over recomputation behavior
- **Simple implementation**: Uses React's built-in `useMemo` dependency array mechanism

## Files to Modify
- `src/hooks/useBooleanVariationDetails.ts`

## Similar Hooks to Update
This pattern should be applied to other variation hooks:
- `useStringVariationDetails`
- `useNumberVariationDetails` 
- `useObjectVariationDetails`
- `useBooleanVariation`
- `useStringVariation`
- `useNumberVariation`
- `useObjectVariation`
- Any other variation hooks that follow the same pattern

## Testing Considerations
- Test default behavior remains unchanged
- Test `updateOnFlagChanged: false` prevents rerenders on `lastUpdated` changes
- Test `updateOnFlagChanged: false` still rerenders on `client`, `flagId`, or `defaultValue` changes
- Test backward compatibility with existing code

## Implementation Priority
1. Start with `useBooleanVariationDetails` as proof of concept
2. Apply same pattern to other `*VariationDetails` hooks
3. Apply to basic variation hooks (`useBooleanVariation`, etc.)
4. Update tests for all modified hooks
5. Update documentation/README if needed

## Technical Notes
- The solution leverages React's `useMemo` dependency array mechanism
- No additional complexity like `useRef` caching needed
- ESLint satisfaction handled through conditional void reference
- Maintains existing hook behavior when `updateOnFlagChanged` defaults to `true`
