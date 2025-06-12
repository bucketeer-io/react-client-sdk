import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  BKTClient,
  BKTConfig,
  BKTUser,
  defineBKTConfig,
  defineBKTUser,
  getBKTClient,
  initializeBKTClient,
} from 'bkt-js-client-sdk';
import {
  BucketeerProvider,
  useBooleanVariation,
  useStringVariation,
  useNumberVariation,
  useObjectVariation,
  useBucketeerClient,
} from '../index';

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

describe('Network Error Handling and Fallback Logic', () => {
  let mockConfig: BKTConfig;
  let mockUser: BKTUser;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    mockUser = defineBKTUser({
      id: 'user-1',
      customAttributes: { foo: 'bar' },
    });

    mockConfig = defineBKTConfig({
      apiKey: 'test-api-key',
      apiEndpoint: 'http://test-endpoint',
      featureTag: 'test-tag',
      eventsFlushInterval: 30,
      eventsMaxQueueSize: 100,
      pollingInterval: 60,
      appVersion: '1.0.0',
      userAgent: 'test-agent',
      fetch: fetch,
      storageFactory: jest.fn(),
    });
  });

  describe('Network Failure During Client Initialization', () => {
    it('handles general network failure gracefully', async () => {
      // Simulate network failure during initialization
      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );
      (getBKTClient as jest.Mock).mockReturnValue(null);

      // Suppress expected console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      let hookResults: {
        booleanValue: boolean;
        stringValue: string;
        numberValue: number;
        objectValue: Record<string, unknown>;
        client: BKTClient | null;
      } = {
        booleanValue: false,
        stringValue: '',
        numberValue: 0,
        objectValue: {},
        client: null,
      };

      const TestComponent = () => {
        const booleanValue = useBooleanVariation('test-flag', false);
        const stringValue = useStringVariation('test-string', 'default');
        const numberValue = useNumberVariation('test-number', 0);
        const objectValue = useObjectVariation('test-object', {
          default: true,
        });
        const { client } = useBucketeerClient();

        // Capture results for verification
        React.useEffect(() => {
          hookResults = {
            booleanValue,
            stringValue,
            numberValue,
            objectValue,
            client,
          };
        });

        return (
          <div>
            <div data-testid="boolean">{booleanValue.toString()}</div>
            <div data-testid="string">{stringValue}</div>
            <div data-testid="number">{numberValue}</div>
            <div data-testid="object">{JSON.stringify(objectValue)}</div>
            <div data-testid="client">{client ? 'available' : 'null'}</div>
          </div>
        );
      };

      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        // Verify that console.error was called with network error
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize Bucketeer client:',
          expect.objectContaining({
            message: 'Network request failed',
          })
        );
      });

      // Verify all hooks return their default values when client fails to initialize
      expect(hookResults.booleanValue).toBe(false);
      expect(hookResults.stringValue).toBe('default');
      expect(hookResults.numberValue).toBe(0);
      expect(hookResults.objectValue).toEqual({ default: true });
      expect(hookResults.client).toBeNull();

      consoleSpy.mockRestore();
    });

    it('handles TimeoutException gracefully with warning', async () => {
      // Create a TimeoutException-like error
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutException';

      // Create mock client for TimeoutException case
      const mockTimeoutClient = {
        booleanVariation: jest.fn().mockReturnValue(true),
        stringVariation: jest.fn().mockReturnValue('test-value'),
        numberVariation: jest.fn().mockReturnValue(42),
        objectVariation: jest.fn().mockReturnValue({ test: 'object' }),
        booleanVariationDetails: jest.fn(),
        stringVariationDetails: jest.fn(),
        numberVariationDetails: jest.fn(),
        objectVariationDetails: jest.fn(),
        currentUser: jest.fn(),
        updateUserAttributes: jest.fn(),
        addEvaluationUpdateListener: jest
          .fn()
          .mockReturnValue('mock-listener-token'),
        removeEvaluationUpdateListener: jest.fn(),
      } as unknown as BKTClient;

      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(timeoutError);
      // For TimeoutException, getBKTClient should return the client (already initialized)
      (getBKTClient as jest.Mock).mockReturnValue(mockTimeoutClient);

      // Suppress expected console.warn for this test
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      let clientFromHook: BKTClient | null = null;

      const TestComponent = () => {
        const { client } = useBucketeerClient();

        React.useEffect(() => {
          clientFromHook = client;
        }, [client]);

        return (
          <div data-testid="timeout-test">
            {client ? 'client-available' : 'client-null'}
          </div>
        );
      };

      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        // Verify that console.warn was called for TimeoutException
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Bucketeer client initialization timed out, but client is already initialized.'
        );
      });

      // For TimeoutException, the client should be available because it's already initialized
      expect(clientFromHook).toBe(mockTimeoutClient);

      consoleWarnSpy.mockRestore();
    });

    it('handles updateUserAttributes gracefully when client initialization fails', async () => {
      // Simulate network failure during initialization
      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(
        new Error('Network failure')
      );
      (getBKTClient as jest.Mock).mockReturnValue(null);

      // Suppress expected console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const TestComponent = () => {
        const { updateUserAttributes } = useBucketeerClient();

        // Test updateUserAttributes with null client
        React.useEffect(() => {
          // This should not throw even when client is null
          updateUserAttributes({ newAttribute: 'value' });
        }, [updateUserAttributes]);

        return <div data-testid="update-test">ready</div>;
      };

      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize Bucketeer client:',
          expect.any(Error)
        );
      });

      // The test passes if no error was thrown during updateUserAttributes call
      // This verifies that updateUserAttributes handles null client gracefully
      expect(true).toBe(true);

      consoleSpy.mockRestore();
    });

    it('handles multiple network failure types during initialization', async () => {
      const networkErrors = [
        new Error('ECONNREFUSED'),
        new Error('ETIMEDOUT'),
        new Error('Network request failed'),
        new Error('Failed to fetch'),
      ];

      for (const error of networkErrors) {
        jest.clearAllMocks();

        (initializeBKTClient as jest.Mock).mockRejectedValueOnce(error);
        (getBKTClient as jest.Mock).mockReturnValue(null);

        const consoleSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        let clientState: BKTClient | null = null;

        const TestComponent = () => {
          const { client } = useBucketeerClient();

          React.useEffect(() => {
            clientState = client;
          }, [client]);

          return <div data-testid="error-test">{error.message}</div>;
        };

        await act(async () => {
          render(
            <BucketeerProvider config={mockConfig} user={mockUser}>
              <TestComponent />
            </BucketeerProvider>
          );
        });

        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to initialize Bucketeer client:',
            error
          );
        });

        // Verify client is null for all network error types
        expect(clientState).toBeNull();

        consoleSpy.mockRestore();
      }
    });

    it('logs appropriate errors without crashing the app', async () => {
      const criticalError = new Error('Critical network failure');

      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(criticalError);
      (getBKTClient as jest.Mock).mockReturnValue(null);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      let appRendered = false;

      const TestComponent = () => {
        appRendered = true;
        const booleanFlag = useBooleanVariation('feature-flag', false);

        return (
          <div data-testid="app-status">
            <div>App is running: {appRendered.toString()}</div>
            <div>Feature enabled: {booleanFlag.toString()}</div>
          </div>
        );
      };

      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <TestComponent />
          </BucketeerProvider>
        );
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize Bucketeer client:',
          criticalError
        );
      });

      // Verify the app continues to render and function despite network errors
      expect(appRendered).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
