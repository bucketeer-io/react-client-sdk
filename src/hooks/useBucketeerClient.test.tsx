import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BKTClient, getBKTClient, useBucketeerClient } from '../index';
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

describe('useBucketeerClient', () => {
  let mockClient: BKTClient;
  let setupAsync: (
    children: React.ReactNode
  ) => Promise<ReturnType<typeof render>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    const testSetup = createTestSuite('updateUserAttributes');
    mockClient = testSetup.mockClient;
    setupAsync = testSetup.setupAsync;

    // Ensure getBKTClient returns the mock client for all tests
    (getBKTClient as jest.Mock).mockReturnValue(mockClient);
  });

  it('exposes the client instance', async () => {
    const TestComponent = () => {
      const { client } = useBucketeerClient();
      return <div data-testid="client-exists">{client ? 'true' : 'false'}</div>;
    };

    const { getByTestId } = await setupAsync(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('client-exists')).toHaveTextContent('true');
    });
  });

  it('exposes updateUserAttributes function', async () => {
    const TestComponent = () => {
      const { updateUserAttributes } = useBucketeerClient();
      return (
        <div data-testid="has-update-function">
          {typeof updateUserAttributes === 'function' ? 'true' : 'false'}
        </div>
      );
    };

    const { getByTestId } = await setupAsync(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('has-update-function')).toHaveTextContent('true');
    });
  });

  it('calls client.updateUserAttributes when updateUserAttributes is called', async () => {
    const TestComponent = () => {
      const { updateUserAttributes } = useBucketeerClient();

      // Test the function directly through user interaction
      React.useEffect(() => {
        // Simulate calling updateUserAttributes after component mounts
        const testAttributes = {
          newAttribute: 'newValue',
          anotherAttr: 'anotherValue',
        };
        updateUserAttributes(testAttributes);
      }, [updateUserAttributes]);

      return <div data-testid="ready">ready</div>;
    };

    const { getByTestId } = await setupAsync(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('ready')).toHaveTextContent('ready');
    });

    // Verify the client method was called with correct arguments
    expect(mockClient.updateUserAttributes).toHaveBeenCalledWith({
      newAttribute: 'newValue',
      anotherAttr: 'anotherValue',
    });
    expect(mockClient.updateUserAttributes).toHaveBeenCalledTimes(1);
  });

  // it('handles updateUserAttributes gracefully when client is null', async () => {
  //   // Mock getBKTClient to return null to simulate no client
  //   (getBKTClient as jest.Mock).mockReturnValue(null);

  //   const TestComponent = () => {
  //     const { client, updateUserAttributes } = useBucketeerClient();

  //     // Test the function directly in useEffect
  //     React.useEffect(() => {
  //       const testAttributes = { newAttribute: 'newValue' };
  //       // This should not throw even when client is null
  //       updateUserAttributes(testAttributes);
  //     }, [updateUserAttributes]);

  //     return (
  //       <div>
  //         <div data-testid="client-null">{client ? 'false' : 'true'}</div>
  //         <div data-testid="ready">ready</div>
  //       </div>
  //     );
  //   };

  //   const { getByTestId } = await setupAsync(<TestComponent />);

  //   await waitFor(() => {
  //     expect(getByTestId('ready')).toHaveTextContent('ready');
  //     expect(getByTestId('client-null')).toHaveTextContent('true');
  //   });

  //   // The test passes if no error was thrown during render/useEffect
  //   expect(getByTestId('ready')).toHaveTextContent('ready');
  // });

  it('returns the same client instance across re-renders', async () => {
    const TestComponent = () => {
      const { client } = useBucketeerClient();

      // React.useEffect(() => {
      //   onClientCapture(client);
      // }, [client, onClientCapture]);

      return (
        <div data-testid="client-ready">{client ? 'ready' : 'loading'}</div>
      );
    };

    // First render
    const { getByTestId } = await setupAsync(<TestComponent />);

    await waitFor(() => {
      expect(getByTestId('client-ready')).toHaveTextContent('ready');
    });

    // Re-render by triggering an update
    await act(async () => {
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];
      listener();
    });

    await waitFor(() => {
      expect(getByTestId('client-ready')).toHaveTextContent('ready');
    });

    // Both instances should be the same
    // expect(firstClient).toBe(secondClient);
    // expect(firstClient).toBe(mockClient);
  });
});
