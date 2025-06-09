import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useNumberVariation } from '../index';
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

describe('useNumberVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('numberVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.numberVariation as jest.Mock)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2);

    function TestComponent() {
      const value = useNumberVariation('flag', 1);
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('1');

    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.numberVariation).toHaveBeenCalledWith('flag', 1);
    });

    // Simulate flag update by triggering the listener
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('2');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.numberVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useNumberVariation('missing-flag', 42);
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('42');
  });
});
