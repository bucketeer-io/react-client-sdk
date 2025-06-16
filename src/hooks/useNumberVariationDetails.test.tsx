import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useNumberVariationDetails } from '../index';
import { createTestSuite } from './testHelpers';
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

describe('useNumberVariationDetails', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('numberVariationDetails');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct evaluation details and updates on flag change', async () => {
    const initialEvaluation = {
      featureId: 'number-flag',
      featureVersion: 1,
      userId: 'test-user',
      variationId: 'variation-1',
      variationName: 'Small Number',
      variationValue: 42,
      reason: 'RULE' as const,
    } satisfies BKTEvaluationDetails<number>;

    const updatedEvaluation = {
      featureId: 'number-flag',
      featureVersion: 2,
      userId: 'test-user',
      variationId: 'variation-2',
      variationName: 'Large Number',
      variationValue: 1000,
      reason: 'TARGET' as const,
    } satisfies BKTEvaluationDetails<number>;

    (mockClient.numberVariationDetails as jest.Mock)
      .mockReturnValueOnce(initialEvaluation)
      .mockReturnValueOnce(updatedEvaluation);

    function TestComponent() {
      const details = useNumberVariationDetails('number-flag', 0);
      return (
        <div>
          <div data-testid="variation-value">
            {String(details.variationValue)}
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
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent('42');
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'number-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('1');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-1'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Small Number'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('RULE');

    // Ensure the client was called with the correct parameters
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.numberVariationDetails).toHaveBeenCalledWith(
        'number-flag',
        0
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
      '1000'
    );
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'number-flag'
    );
    expect(renderResult.getByTestId('feature-version')).toHaveTextContent('2');
    expect(renderResult.getByTestId('user-id')).toHaveTextContent('test-user');
    expect(renderResult.getByTestId('variation-id')).toHaveTextContent(
      'variation-2'
    );
    expect(renderResult.getByTestId('variation-name')).toHaveTextContent(
      'Large Number'
    );
    expect(renderResult.getByTestId('reason')).toHaveTextContent('TARGET');
  });

  it('falls back to default evaluation details if flag missing', async () => {
    (mockClient.numberVariationDetails as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const details = useNumberVariationDetails('missing-number-flag', 99);
      return (
        <div>
          <div data-testid="variation-value">
            {String(details.variationValue)}
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
    expect(renderResult.getByTestId('variation-value')).toHaveTextContent('99');
    expect(renderResult.getByTestId('feature-id')).toHaveTextContent(
      'missing-number-flag'
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
      expect(mockClient.numberVariationDetails).toHaveBeenCalledWith(
        'missing-number-flag',
        99
      );
    });
  });
});
