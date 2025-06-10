import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useStringVariation } from '../index';
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

describe('useStringVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('stringVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.stringVariation as jest.Mock)
      .mockReturnValueOnce('A')
      .mockReturnValueOnce('B');

    function TestComponent() {
      const value = useStringVariation('flag', 'A');
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('A');

    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.stringVariation).toHaveBeenCalledWith('flag', 'A');
    });

    // Simulate flag update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('B');
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.stringVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const value = useStringVariation('missing-flag', 'default');
      return <div data-testid="flag-value">{value}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('default');

    // Ensure the client was called with the correct default value
    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.stringVariation).toHaveBeenCalledWith(
        'missing-flag',
        'default'
      );
    });

    expect(renderResult.getByTestId('flag-value')).toHaveTextContent('default');
  });
});
