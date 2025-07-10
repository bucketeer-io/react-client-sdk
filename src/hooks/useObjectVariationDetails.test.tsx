/**
 * Tests for useObjectVariationDetails hook
 *
 * Intent: Test the core hook functionality that returns a full BKTEvaluationDetails<T> object
 *
 * Strategy:
 * - Test with actual client mock (integration-style tests)
 * - Verify all properties of BKTEvaluationDetails<T> are correctly returned
 * - Test fallback logic when flag is missing or client is unavailable
 * - Test flag update mechanisms
 * - Test type safety with complex object types
 *
 * Note: We don't test React's re-rendering behavior - that's React's responsibility.
 * If re-rendering was broken, our tests for value updates would fail anyway.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useObjectVariationDetails } from '../index';
import { createTestSuite } from './testHelpers';
import { BucketeerContext } from '../context';
import type { BKTEvaluationDetails } from 'bkt-js-client-sdk';

jest.mock('bkt-js-client-sdk', () => {
  const actual = jest.requireActual('bkt-js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});

(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

describe('useObjectVariationDetails', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('objectVariationDetails');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct evaluation details and updates on flag change', async () => {
    const initialConfig = { theme: 'dark', size: 'large', count: 3 };
    const updatedConfig = { theme: 'light', size: 'small', count: 5 };

    const initialEvaluation = {
      featureId: 'object-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Dark Theme Config',
      variationValue: initialConfig,
      reason: 'RULE' as const,
    } satisfies BKTEvaluationDetails<typeof initialConfig>;

    const updatedEvaluation = {
      featureId: 'object-flag',
      featureVersion: 2,
      userId: 'test-user',
      variationId: 'variation-2',
      variationName: 'Light Theme Config',
      variationValue: updatedConfig,
      reason: 'TARGET' as const,
    } satisfies BKTEvaluationDetails<typeof updatedConfig>;

    (mockClient.objectVariationDetails as jest.Mock)
      .mockReturnValueOnce(initialEvaluation)
      .mockReturnValueOnce(updatedEvaluation);

    function TestComponent() {
      const defaultConfig = { theme: 'default', size: 'medium', count: 0 };
      const details = useObjectVariationDetails('object-flag', defaultConfig);
      return (
        <div>
          <div data-testid="variation-value">
            {JSON.stringify(details.variationValue)}
          </div>
          <div data-testid="feature-id">{details.featureId}</div>
          <div data-testid="feature-version">{details.featureVersion}</div>
          <div data-testid="user-id">{details.userId}</div>
          <div data-testid="variation-id">{details.variationId}</div>
          <div data-testid="variation-name">{details.variationName}</div>
          <div data-testid="reason">{details.reason}</div>
        </div>
      );
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial evaluation details - verify all properties
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(
      JSON.stringify(initialConfig)
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'object-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('1');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-1'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Dark Theme Config'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('RULE');

    // Ensure the client was called with the correct parameters
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.objectVariationDetails).toHaveBeenCalledWith(
        'object-flag',
        { theme: 'default', size: 'medium', count: 0 }
      );
    });

    // Simulate flag update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated evaluation details - verify all properties changed
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(
      JSON.stringify(updatedConfig)
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'object-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('2');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-2'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Light Theme Config'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('TARGET');
  });

  it('falls back to default evaluation details if flag missing', async () => {
    (mockClient.objectVariationDetails as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const defaultSettings = { enabled: true, level: 'info' };
      const details = useObjectVariationDetails(
        'missing-object-flag',
        defaultSettings
      );
      return (
        <div>
          <div data-testid="variation-value">
            {JSON.stringify(details.variationValue)}
          </div>
          <div data-testid="feature-id">{details.featureId}</div>
          <div data-testid="feature-version">{details.featureVersion}</div>
          <div data-testid="user-id">{details.userId}</div>
          <div data-testid="variation-id">{details.variationId}</div>
          <div data-testid="variation-name">{details.variationName}</div>
          <div data-testid="reason">{details.reason}</div>
        </div>
      );
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check default evaluation details structure - verify all properties
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(
      JSON.stringify({ enabled: true, level: 'info' })
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'missing-object-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('0');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent('');
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent('');
    expect(renderResult.getByTestId('reason')).toHaveTextContent('DEFAULT');

    // Ensure the client was called with the correct parameters
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.objectVariationDetails).toHaveBeenCalledWith(
        'missing-object-flag',
        { enabled: true, level: 'info' }
      );
    });
  });

  // Memoization tests
  describe('memoization', () => {
    let memoMockClient: BKTClient;
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      const testSetup = createTestSuite('objectVariationDetails');
      memoMockClient = testSetup.mockClient;
    });

    // Helper to create a wrapper with context for memoization tests
    const createMemoWrapper = (
      client: BKTClient | null,
      lastUpdated: number
    ) => {
      // eslint-disable-next-line react/display-name
      return ({ children }: { children: React.ReactNode }) => (
        <BucketeerContext.Provider value={{ client, lastUpdated }}>
          {children}
        </BucketeerContext.Provider>
      );
    };

    it('should not call client.objectVariationDetails multiple times when defaultValue object has same content', () => {
      const flagId = 'test-flag';

      // Mock the client method to return a consistent result
      (memoMockClient.objectVariationDetails as jest.Mock).mockReturnValue({
        featureId: flagId,
        featureVersion: 1,
        userId: 'test-user',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: { timeout: 5000, retries: 3 },
        reason: 'TARGETING',
      });

      const wrapper = createMemoWrapper(memoMockClient, 1);

      // First render with object literal
      const { rerender } = renderHook(
        () => useObjectVariationDetails(flagId, { timeout: 5000, retries: 3 }),
        { wrapper }
      );

      // Second render with same object literal (different reference, same content)
      rerender();

      // Third render with same object literal again
      rerender();

      // The client method should only be called once due to memoization
      expect(memoMockClient.objectVariationDetails).toHaveBeenCalledTimes(1);
      expect(memoMockClient.objectVariationDetails).toHaveBeenCalledWith(
        flagId,
        {
          timeout: 5000,
          retries: 3,
        }
      );
    });

    it('should call client.objectVariationDetails again when defaultValue content actually changes', () => {
      const flagId = 'test-flag';

      (memoMockClient.objectVariationDetails as jest.Mock).mockReturnValue({
        featureId: flagId,
        featureVersion: 1,
        userId: 'test-user',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: { timeout: 5000, retries: 3 },
        reason: 'TARGETING',
      });

      const wrapper = createMemoWrapper(memoMockClient, 1);

      // First render
      const { rerender } = renderHook(
        ({
          defaultValue,
        }: {
          defaultValue: { timeout: number; retries: number };
        }) => useObjectVariationDetails(flagId, defaultValue),
        {
          wrapper,
          initialProps: { defaultValue: { timeout: 5000, retries: 3 } },
        }
      );

      // Second render with different content
      rerender({ defaultValue: { timeout: 10000, retries: 5 } });

      // Should be called twice - once for each different defaultValue
      expect(memoMockClient.objectVariationDetails).toHaveBeenCalledTimes(2);
      expect(memoMockClient.objectVariationDetails).toHaveBeenNthCalledWith(
        1,
        flagId,
        { timeout: 5000, retries: 3 }
      );
      expect(memoMockClient.objectVariationDetails).toHaveBeenNthCalledWith(
        2,
        flagId,
        { timeout: 10000, retries: 5 }
      );
    });

    it('should return stable reference when defaultValue object reference changes but content is same', () => {
      const flagId = 'test-flag';

      (memoMockClient.objectVariationDetails as jest.Mock).mockReturnValue({
        featureId: flagId,
        featureVersion: 1,
        userId: 'test-user',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: { timeout: 5000, retries: 3 },
        reason: 'TARGETING',
      });

      const wrapper = createMemoWrapper(memoMockClient, 1);

      // First render
      const { result, rerender } = renderHook(
        () => useObjectVariationDetails(flagId, { timeout: 5000, retries: 3 }),
        { wrapper }
      );

      const firstResult = result.current;

      // Second render with same object content but different reference
      rerender();

      const secondResult = result.current;

      // Results should be the same reference due to memoization
      expect(firstResult).toBe(secondResult);
      expect(memoMockClient.objectVariationDetails).toHaveBeenCalledTimes(1);
    });
  });
});
