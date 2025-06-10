import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useBooleanVariation } from '../index';
import { createTestSuite } from './testHelpers';

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

describe('useBooleanVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('booleanVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.booleanVariation as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    function TestComponent() {
      const value = useBooleanVariation('flag', false);
      return <div data-testid="flag-value">{String(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('false');

    // Ensure the client was called with the correct default value
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.booleanVariation).toHaveBeenCalledWith('flag', false);
    });

    // Simulate flag update
    await act(async () => {
      (mockClient.booleanVariation as jest.Mock).mockReturnValueOnce(true);
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('true');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.booleanVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useBooleanVariation('missing-flag', true);
      return <div data-testid="flag-value">{String(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('true');

    // Ensure the client was called with the correct default value
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.booleanVariation).toHaveBeenCalledWith(
        'missing-flag',
        true
      );
    });

    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('true');
  });
});
