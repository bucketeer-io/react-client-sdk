import React, { useContext } from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  BKTClient,
  getBKTClient,
  initializeBKTClient,
} from 'bkt-js-client-sdk';
import {
  useBooleanVariation,
  useStringVariation,
  BucketeerProvider,
  BucketeerContext,
} from '.';

// Mock global fetch before any SDK code runs
(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

// Mock only specific functions from bkt-js-client-sdk
jest.mock('bkt-js-client-sdk', () => {
  const actual = jest.requireActual('bkt-js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});

describe('Reliability and Edge Case Tests', () => {
  let mockClient: BKTClient;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Create mock client with necessary methods
    mockClient = {
      booleanVariationDetails: jest.fn().mockReturnValue({
        featureId: 'test-flag',
        featureVersion: 1,
        userId: 'user-1',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: true,
        reason: 'RULE',
      }),
      stringVariationDetails: jest.fn().mockReturnValue({
        featureId: 'test-flag',
        featureVersion: 1,
        userId: 'user-1',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: 'test-value',
        reason: 'RULE',
      }),
      numberVariationDetails: jest.fn().mockReturnValue({
        featureId: 'test-flag',
        featureVersion: 1,
        userId: 'user-1',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: 42,
        reason: 'RULE',
      }),
      objectVariationDetails: jest.fn().mockReturnValue({
        featureId: 'test-flag',
        featureVersion: 1,
        userId: 'user-1',
        variationId: 'variation-1',
        variationName: 'Test Variation',
        variationValue: { test: 'object' },
        reason: 'RULE',
      }),
      currentUser: jest.fn(),
      updateUserAttributes: jest.fn(),
      addEvaluationUpdateListener: jest
        .fn()
        .mockReturnValue('mock-listener-token'),
      removeEvaluationUpdateListener: jest.fn(),
    } as unknown as BKTClient;

    (getBKTClient as jest.Mock).mockReturnValue(mockClient);
    (initializeBKTClient as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Memory Leak Prevention', () => {
    it('cleans up listeners on unmount to prevent memory leaks', async () => {
      const TestComponent = () => {
        const { client } = useContext(BucketeerContext);
        return <div data-testid="client">{client ? 'ready' : 'loading'}</div>;
      };

      const { unmount, getByTestId } = await act(async () => {
        return render(
          <BucketeerProvider client={mockClient}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        expect(getByTestId('client')).toHaveTextContent('ready');
      });

      // Verify listener was added
      expect(mockClient.addEvaluationUpdateListener).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockClient.addEvaluationUpdateListener).toHaveBeenCalledTimes(1);

      // Unmount the component
      unmount();

      // Verify listener was removed to prevent memory leaks
      expect(mockClient.removeEvaluationUpdateListener).toHaveBeenCalledWith(
        'mock-listener-token'
      );
      expect(mockClient.removeEvaluationUpdateListener).toHaveBeenCalledTimes(
        1
      );
    });

    it('handles multiple mount/unmount cycles without listener accumulation', async () => {
      const TestComponent = () => {
        const flagValue = useBooleanVariation('test-flag', false);
        return <div data-testid="flag">{flagValue.toString()}</div>;
      };

      // Mount and unmount multiple times
      for (let i = 0; i < 3; i++) {
        const { unmount, getByTestId } = await act(async () => {
          return render(
            <BucketeerProvider client={mockClient}>
              <TestComponent />
            </BucketeerProvider>
          );
        });

        await waitFor(() => {
          expect(getByTestId('flag')).toHaveTextContent('true');
        });

        unmount();
      }

      // Each mount should add one listener, each unmount should remove one
      expect(mockClient.addEvaluationUpdateListener).toHaveBeenCalledTimes(3);
      expect(mockClient.removeEvaluationUpdateListener).toHaveBeenCalledTimes(
        3
      );
    });
  });

  describe('Rapid Flag Updates', () => {
    it('handles rapid successive flag updates without race conditions', async () => {
      let updateCount = 0;
      const TestComponent = () => {
        const flagValue = useBooleanVariation('rapid-flag', false);

        React.useEffect(() => {
          updateCount++;
        }, [flagValue]);

        return <div data-testid="flag-value">{flagValue.toString()}</div>;
      };

      const { getByTestId } = await act(async () => {
        return render(
          <BucketeerProvider client={mockClient}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        expect(getByTestId('flag-value')).toHaveTextContent('true');
      });

      // Get the listener function
      const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mock.calls[0][0];

      // Test sequence: true -> false -> true -> false -> true (final)
      // Each update should be processed individually

      // Update 1: true -> false
      await act(async () => {
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'test-flag',
          featureVersion: 2,
          userId: 'user-1',
          variationId: 'variation-2',
          variationName: 'False Variation',
          variationValue: false,
          reason: 'RULE',
        });
        listener();
      });
      await waitFor(() => {
        expect(getByTestId('flag-value')).toHaveTextContent('false');
      });

      // Update 2: false -> true
      await act(async () => {
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'test-flag',
          featureVersion: 3,
          userId: 'user-1',
          variationId: 'variation-1',
          variationName: 'True Variation',
          variationValue: true,
          reason: 'RULE',
        });
        listener();
      });
      await waitFor(() => {
        expect(getByTestId('flag-value')).toHaveTextContent('true');
      });

      // Update 3: true -> false
      await act(async () => {
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'test-flag',
          featureVersion: 4,
          userId: 'user-1',
          variationId: 'variation-2',
          variationName: 'False Variation',
          variationValue: false,
          reason: 'RULE',
        });
        listener();
      });
      await waitFor(() => {
        expect(getByTestId('flag-value')).toHaveTextContent('false');
      });

      // Update 4: false -> true (final state)
      await act(async () => {
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'test-flag',
          featureVersion: 5,
          userId: 'user-1',
          variationId: 'variation-1',
          variationName: 'True Variation',
          variationValue: true,
          reason: 'RULE',
        });
        listener();
      });
      await waitFor(() => {
        expect(getByTestId('flag-value')).toHaveTextContent('true');
      });

      // Component should have handled all updates gracefully
      expect(updateCount).toBeGreaterThan(4); // Initial + 4 updates
    });

    it('handles concurrent updates to different flags', async () => {
      const TestComponent = () => {
        const boolFlag = useBooleanVariation('bool-flag', false);
        const stringFlag = useStringVariation('string-flag', 'default');

        return (
          <div>
            <div data-testid="bool-flag">{boolFlag.toString()}</div>
            <div data-testid="string-flag">{stringFlag}</div>
          </div>
        );
      };

      (mockClient.stringVariationDetails as jest.Mock).mockReturnValue({
        featureId: 'string-flag',
        featureVersion: 1,
        userId: 'user-1',
        variationId: 'variation-1',
        variationName: 'Initial String',
        variationValue: 'initial',
        reason: 'RULE',
      });

      const { getByTestId } = await act(async () => {
        return render(
          <BucketeerProvider client={mockClient}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        expect(getByTestId('bool-flag')).toHaveTextContent('true');
        expect(getByTestId('string-flag')).toHaveTextContent('initial');
      });

      // Simulate concurrent flag updates
      await act(async () => {
        const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
          .mock.calls[0][0];

        // Update both flags simultaneously
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'bool-flag',
          featureVersion: 2,
          userId: 'user-1',
          variationId: 'variation-2',
          variationName: 'False Variation',
          variationValue: false,
          reason: 'RULE',
        });
        (mockClient.stringVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'string-flag',
          featureVersion: 2,
          userId: 'user-1',
          variationId: 'variation-2',
          variationName: 'Updated String',
          variationValue: 'updated',
          reason: 'RULE',
        });

        listener(); // Single listener update affects all flags
      });

      // Both flags should update correctly
      expect(getByTestId('bool-flag')).toHaveTextContent('false');
      expect(getByTestId('string-flag')).toHaveTextContent('updated');
    });
  });

  describe('Component Unmount Safety', () => {
    it('handles hook usage in component that unmounts during flag evaluation', async () => {
      let shouldShowComponent = true;
      let forceUpdate: () => void;

      const ParentComponent = () => {
        const [, setTick] = React.useState(0);
        forceUpdate = () => setTick((tick) => tick + 1);

        return (
          <BucketeerProvider client={mockClient}>
            {shouldShowComponent && <ChildComponent />}
          </BucketeerProvider>
        );
      };

      const ChildComponent = () => {
        const flagValue = useBooleanVariation('test-flag', false);
        return <div data-testid="child">{flagValue.toString()}</div>;
      };

      const { getByTestId, queryByTestId } = render(<ParentComponent />);

      await waitFor(() => {
        expect(getByTestId('child')).toHaveTextContent('true');
      });

      // Unmount child component while it might be processing updates
      await act(async () => {
        shouldShowComponent = false;
        forceUpdate();
      });

      // Child should be unmounted
      expect(queryByTestId('child')).not.toBeInTheDocument();

      // Trigger a flag update after child is unmounted
      await act(async () => {
        const listener = (mockClient.addEvaluationUpdateListener as jest.Mock)
          .mock.calls[0][0];
        (mockClient.booleanVariationDetails as jest.Mock).mockReturnValue({
          featureId: 'test-flag',
          featureVersion: 2,
          userId: 'user-1',
          variationId: 'variation-2',
          variationName: 'False Variation',
          variationValue: false,
          reason: 'RULE',
        });
        listener();
      });

      // Should not cause any errors or warnings
      expect(queryByTestId('child')).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('recovers gracefully from listener setup failures', async () => {
      // Mock listener setup to fail initially, then succeed
      (mockClient.addEvaluationUpdateListener as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Listener setup failed');
        })
        .mockReturnValue('mock-listener-token');

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const TestComponent = () => {
        const { client } = useContext(BucketeerContext);
        return <div data-testid="client">{client ? 'ready' : 'loading'}</div>;
      };

      const { getByTestId } = await act(async () => {
        return render(
          <BucketeerProvider client={mockClient}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        // Even with listener setup failure, component should handle it gracefully
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize Bucketeer client listener:',
          expect.any(Error)
        );
      });

      expect(getByTestId('client')).toHaveTextContent('ready');

      consoleSpy.mockRestore();
    });
  });
});
