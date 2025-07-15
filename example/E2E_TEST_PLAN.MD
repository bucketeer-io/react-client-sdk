# E2E Test Plan for Bucketeer React Client SDK

## Overview
This document outlines best practices and strategies for end-to-end testing of the Bucketeer React Client SDK. E2E tests validate the complete integration between the SDK, React components, and the Bucketeer service.

## Best Practices for React SDK E2E Testing

### 1. Test Environment Setup

#### 1.1 Use Real Backend Services
- Test against actual Bucketeer API endpoints (staging/test environment)
- Use real feature flags configured in Bucketeer dashboard
- Avoid mocking the entire backend to catch integration issues

#### 1.2 Environment Configuration
```typescript
// e2e.config.ts
export const e2eConfig = {
  bucketeer: {
    apiKey: process.env.E2E_BUCKETEER_API_KEY,
    apiEndpoint: process.env.E2E_BUCKETEER_API_ENDPOINT,
    timeout: 10000,
  },
  testUser: {
    id: 'e2e-test-user',
    customAttributes: {
      test_environment: 'e2e',
      timestamp: Date.now().toString(),
    },
  },
};
```

### 2. Testing Strategy

#### 2.1 Component Integration Tests
Test React components that use SDK hooks in realistic scenarios:

```typescript
// Test component that uses multiple variation hooks
const TestComponent = () => {
  const showFeature = useBooleanVariation('test-feature', false);
  const theme = useStringVariation('theme', 'light');
  const config = useObjectVariation('config', {});
  
  return (
    <div data-testid="feature-component">
      {showFeature && <div data-testid="new-feature">New Feature</div>}
      <div data-testid="theme" className={theme}>Theme: {theme}</div>
      <div data-testid="config">{JSON.stringify(config)}</div>
    </div>
  );
};
```

#### 2.2 SDK Lifecycle Tests
- Client initialization and destruction
- Provider mounting and unmounting
- Hook subscription and unsubscription
- Memory leak prevention

#### 2.3 Real-time Update Tests
- Feature flag changes propagated to components
- Multiple components updating simultaneously
- Update batching and performance

### 3. Test Categories

#### 3.1 Smoke Tests (Critical Path)
- [ ] SDK initializes successfully with valid config
- [ ] Provider renders children without errors
- [ ] All variation hooks return default values when disconnected
- [ ] Basic feature flag evaluation works

#### 3.2 Feature Flag Evaluation Tests
- [ ] Boolean variations with true/false values
- [ ] String variations with different values
- [ ] Number variations with various numeric types
- [ ] Object variations with complex JSON structures
- [ ] Default value fallback when flag doesn't exist
- [ ] Default value fallback when API is unreachable

#### 3.3 User Context Tests
- [ ] User attributes affect flag evaluation
- [ ] User ID changes trigger re-evaluation
- [ ] Custom attributes are properly sent
- [ ] User context updates propagate to all hooks

#### 3.4 Provider Tests
- [ ] Multiple providers in component tree (should warn/error)
- [ ] Provider unmounting cleans up resources
- [ ] Children re-render when client changes
- [ ] Context value memoization prevents unnecessary renders

#### 3.5 Error Handling Tests
- [ ] Invalid API key handling
- [ ] Network connectivity issues
- [ ] Malformed configuration
- [ ] Invalid user objects
- [ ] API rate limiting responses

#### 3.6 Performance Tests
- [ ] Initial load time within acceptable limits
- [ ] Memory usage remains stable over time
- [ ] Multiple hook calls don't cause performance degradation
- [ ] Update propagation happens within acceptable timeframes

### 4. Test Implementation Tools

#### 4.1 Recommended Testing Stack
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "cypress": "^13.0.0",
    "@testing-library/cypress": "^10.0.0",
    "msw": "^2.0.0"
  }
}
```

#### 4.2 Playwright Configuration Example
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm example:start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5. Test Data Management

#### 5.1 Feature Flag Test Data
Create dedicated test flags in Bucketeer:
```yaml
# Test flags configuration
test-flags:
  - id: "e2e-boolean-flag"
    type: "boolean"
    variations: [true, false]
    default: false
    
  - id: "e2e-string-flag"
    type: "string"
    variations: ["red", "blue", "green"]
    default: "red"
    
  - id: "e2e-number-flag"
    type: "number"
    variations: [10, 20, 50]
    default: 10
    
  - id: "e2e-object-flag"
    type: "object"
    variations: 
      - '{"theme": "dark", "features": ["chat", "notifications"]}'
      - '{"theme": "light", "features": ["chat"]}'
    default: '{"theme": "light", "features": []}'
```

#### 5.2 Test User Segmentation
```typescript
// Create test users for different scenarios
const testUsers = {
  basicUser: {
    id: 'e2e-basic-user',
    customAttributes: { segment: 'basic' }
  },
  premiumUser: {
    id: 'e2e-premium-user',
    customAttributes: { segment: 'premium', plan: 'pro' }
  },
  betaUser: {
    id: 'e2e-beta-user',
    customAttributes: { segment: 'beta', early_access: 'true' }
  }
};
```

### 6. Sample E2E Test Structure

#### 6.1 Full Integration Test
```typescript
// e2e/sdk-integration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bucketeer React SDK E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="sdk-initialized"]');
  });

  test('should evaluate boolean feature flag correctly', async ({ page }) => {
    // Wait for SDK to initialize and load flags
    await expect(page.locator('[data-testid="boolean-flag"]')).toBeVisible();
    
    // Verify the flag value matches expected behavior
    const flagValue = await page.locator('[data-testid="boolean-flag"]').textContent();
    expect(flagValue).toMatch(/true|false/);
    
    // Test that changing user attributes affects evaluation
    await page.click('[data-testid="change-user-button"]');
    await expect(page.locator('[data-testid="boolean-flag"]')).toHaveText(/updated/);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate network failure
    await context.setOffline(true);
    
    // Reload page to test offline behavior
    await page.reload();
    
    // Should show default values
    await expect(page.locator('[data-testid="boolean-flag"]')).toHaveText('false');
    await expect(page.locator('[data-testid="string-flag"]')).toHaveText('light');
    
    // Restore network
    await context.setOffline(false);
    await page.reload();
    
    // Should load actual flag values
    await page.waitForSelector('[data-testid="sdk-initialized"]');
  });

  test('should update multiple components when flags change', async ({ page }) => {
    // Test real-time updates (if supported)
    const component1 = page.locator('[data-testid="component-1"]');
    const component2 = page.locator('[data-testid="component-2"]');
    
    await expect(component1).toBeVisible();
    await expect(component2).toBeVisible();
    
    // Trigger flag update through admin panel or API
    // This would require integration with Bucketeer admin API
    // await updateFeatureFlag('test-flag', true);
    
    // Verify both components update
    // await expect(component1).toHaveText(/enabled/);
    // await expect(component2).toHaveText(/enabled/);
  });
});
```

### 7. CI/CD Integration

#### 7.1 Pipeline Configuration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - name: Run E2E tests
        env:
          E2E_BUCKETEER_API_KEY: ${{ secrets.E2E_BUCKETEER_API_KEY }}
          E2E_BUCKETEER_API_ENDPOINT: ${{ secrets.E2E_BUCKETEER_API_ENDPOINT }}
        run: pnpm test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-test-results
          path: test-results/
```

### 8. Monitoring and Debugging

#### 8.1 Test Observability
- Log SDK initialization events
- Track flag evaluation timing
- Monitor API response times
- Capture network requests/responses

#### 8.2 Debugging Helpers
```typescript
// Add debugging utilities for tests
window.__BKT_DEBUG__ = {
  getClient: () => getBKTClient(),
  getFlags: () => client?.getAllFlags(),
  getUserContext: () => client?.getUserContext(),
  toggleFlag: (flagId: string, value: any) => {
    // Helper for manual testing
  }
};
```

### 9. Test Maintenance

#### 9.1 Regular Maintenance Tasks
- [ ] Update test flags when SDK features change
- [ ] Review and update timeout values
- [ ] Monitor test execution times
- [ ] Clean up obsolete test data
- [ ] Update browser versions for testing

#### 9.2 Documentation
- Keep test documentation up-to-date
- Document test flag purposes and expected values
- Maintain runbook for debugging failed tests
- Document environment setup requirements

## Conclusion

Effective E2E testing for a React SDK requires:
1. Testing against real backend services
2. Covering both happy path and error scenarios
3. Validating real-time updates and performance
4. Maintaining test data and environments
5. Integrating with CI/CD pipelines

Focus on testing the integration points and user-facing behavior rather than implementation details, which should be covered by unit tests.