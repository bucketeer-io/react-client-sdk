/**
 * Tests for useStringVariationDetails hook
 *
 * Intent: Test the complete evaluation details functionality for string variations
 *
 * Strategy:
 * - Mock client.stringVariationDetails directly
 * - Test complete BKTEvaluationDetails<string> object verification
 * - Test fallback behavior when client is unavailable
 * - Test updates when evaluation changes
 *
 * This provides comprehensive coverage of the core string variation details logic.
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { BKTClient, useStringVariationDetails } from '../index';
import { createTestSuite } from './testHelpers';
import type { BKTEvaluationDetails } from '@bucketeer/js-client-sdk';

jest.mock('@bucketeer/js-client-sdk', () => {
  const actual = jest.requireActual('@bucketeer/js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});

(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

describe('useStringVariationDetails', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('stringVariationDetails');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct evaluation details and updates on flag change', async () => {
    const initialEvaluation = {
      featureId: 'string-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Variation 1',
      variationValue: 'hello',
      reason: 'RULE' as const,
    } satisfies BKTEvaluationDetails<string>;

    const updatedEvaluation = {
      featureId: 'string-flag',
      featureVersion: 2,
      userId: 'test-user',
      variationId: 'variation-2',
      variationName: 'Variation 2',
      variationValue: 'world',
      reason: 'TARGET' as const,
    } satisfies BKTEvaluationDetails<string>;

    (mockClient.stringVariationDetails as jest.Mock)
      .mockReturnValueOnce(initialEvaluation)
      .mockReturnValueOnce(updatedEvaluation);

    function TestComponent() {
      const details = useStringVariationDetails('string-flag', 'default');
      return (
        <div>
          <div data-testid="variation-value">{details.variationValue}</div>
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
      'hello'
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'string-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('1');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-1'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Variation 1'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('RULE');

    // Ensure the client was called with correct parameters
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.stringVariationDetails).toHaveBeenCalledWith(
        'string-flag',
        'default'
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
      'world'
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'string-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('2');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-2'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Variation 2'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('TARGET');
  });

  it('falls back to default evaluation details if flag missing', async () => {
    (mockClient.stringVariationDetails as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const details = useStringVariationDetails('missing-flag', 'fallback');
      return (
        <div>
          <div data-testid="variation-value">{details.variationValue}</div>
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
      'fallback'
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'missing-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('0');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent('');
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent('');
    expect(renderResult.getByTestId('reason')).toHaveTextContent('DEFAULT');

    // Ensure the client was called with correct parameters
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.stringVariationDetails).toHaveBeenCalledWith(
        'missing-flag',
        'fallback'
      );
    });
  });
});
