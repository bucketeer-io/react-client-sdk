# Bucketeer React Client SDK Test Plan

This document tracks the test plan for the SDK, split into Unit and Integration (E2E) sections. Each item is a checklist to be checked off as tests are implemented.

---

## Unit Tests

- [ ] BucketeerProvider initializes client and provides context
- [ ] BucketeerProvider handles invalid config/user gracefully
- [ ] useBooleanVariation returns correct value and updates on flag change
- [ ] useBooleanVariation falls back to default if flag missing
- [ ] useStringVariation returns correct value and updates on flag change
- [ ] useStringVariation falls back to default if flag missing
- [ ] useNumberVariation returns correct value and updates on flag change
- [ ] useNumberVariation falls back to default if flag missing
- [ ] useObjectVariation returns correct value and updates on flag change
- [ ] useObjectVariation falls back to default if flag missing
- [ ] useBucketeerClient exposes client and updateUserAttributes
- [ ] All hooks enforce correct types (TypeScript)
- [ ] Handles network errors and fallback logic
- [ ] Simulate remote flag changes and verify all hooks/components re-render

## Integration (E2E) Tests

- [ ] Example app: all hooks work together in a real React tree
- [ ] Provider can be nested or re-mounted without breaking context
- [ ] Changing user attributes updates flag values as expected
- [ ] All public API surfaces are covered (happy path and edge cases)

---

Check off each item as you implement and verify the tests.

---

**Note:** For E2E tests, do not use any mock, fake, or stub. All E2E tests must use a real Bucketeer backend and real network interactions.

## CI/CD

- [ ] Update CI/CD workflow to run all unit tests
- [ ] Update CI/CD workflow to run all E2E tests (with real Bucketeer backend, no mocks)
