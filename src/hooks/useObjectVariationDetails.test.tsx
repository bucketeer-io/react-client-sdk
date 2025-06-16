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
import { act } from 'react';
import { BKTClient, useObjectVariationDetails } from '../index';
import { createTestSuite } from './testHelpers';
import { BKTEvaluationDetails } from 'bkt-js-client-sdk';

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
      const defaultConfig = React.useMemo(() => ({ theme: 'default', size: 'medium', count: 0 }), []);
      const details = useObjectVariationDetails('object-flag', defaultConfig);
      return (
        <div>
          <div data-testid="variation-value">{JSON.stringify(details.variationValue)}</div>
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
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(JSON.stringify(initialConfig));
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent('object-flag');
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('1');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent('variation-1');
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent('Dark Theme Config');
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
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(JSON.stringify(updatedConfig));
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent('object-flag');
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('2');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent('variation-2');
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent('Light Theme Config');
    expect(renderResult.getByTestId('reason')).toHaveTextContent('TARGET');
  });

  it('falls back to default evaluation details if flag missing', async () => {
    (mockClient.objectVariationDetails as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const defaultSettings = React.useMemo(() => ({ enabled: true, level: 'info' }), []);
      const details = useObjectVariationDetails('missing-object-flag', defaultSettings);
      return (
        <div>
          <div data-testid="variation-value">{JSON.stringify(details.variationValue)}</div>
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
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent(JSON.stringify({ enabled: true, level: 'info' }));
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent('missing-object-flag');
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
});
