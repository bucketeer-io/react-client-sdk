import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, useObjectVariation } from '../index';
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

describe('useObjectVariation', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('objectVariation');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;
  });

  it('returns correct value and updates on flag change', async () => {
    (mockClient.objectVariation as jest.Mock)
      .mockReturnValueOnce({ foo: 1 })
      .mockReturnValueOnce({ foo: 2 });

    function TestComponent() {
      const defaultObj = React.useMemo(() => ({ foo: 1 }), []);
      const value = useObjectVariation('flag', defaultObj);
      return <div data-testid="flag-value">{JSON.stringify(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);

    // Check initial value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"foo":1}'
    );

    await waitFor(() => {
      expect(
        (mockClient.addEvaluationUpdateListener as jest.Mock).mock.calls.length
      ).toBeGreaterThan(0);
      expect(mockClient.objectVariation).toHaveBeenCalledWith('flag', {
        foo: 1,
      });
    });

    // Simulate flag update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    // Check updated value
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"foo":2}'
    );
  });

  it('falls back to default if flag missing', async () => {
    (mockClient.objectVariation as jest.Mock).mockReturnValue(undefined);

    function TestComponent() {
      const defaultObj = React.useMemo(() => ({ bar: 123 }), []);
      const value = useObjectVariation('missing-flag', defaultObj);
      return <div data-testid="flag-value">{JSON.stringify(value)}</div>;
    }

    const renderResult = await setupAsync(<TestComponent />);
    expect(renderResult.getByTestId('flag-value')).toHaveTextContent(
      '{"bar":123}'
    );
  });
});
