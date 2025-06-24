import React, { useContext } from 'react';
import { render, renderHook } from '@testing-library/react';
import { act } from 'react';
import {
  hello,
  BucketeerProvider,
  BucketeerContext,
  defineBKTConfigForReact,
} from './index';
import {
  BKTClient,
  BKTConfig,
  BKTUser,
  defineBKTUser,
  destroyBKTClient,
  getBKTClient,
  initializeBKTClient,
} from 'bkt-js-client-sdk';
import { BucketeerProvider2 } from './BucketeerProvider';

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

// Use helpers to create valid config and user with mocked fetch and storage
let mockConfig: BKTConfig;
let mockUser: BKTUser;
let mockClient: BKTClient;

beforeEach(() => {
  mockUser = defineBKTUser({
    id: 'user-1',
    customAttributes: { foo: 'bar' },
  });
  mockConfig = defineBKTConfigForReact({
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
  // Create mock client with necessary methods
  mockClient = {
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
  // Setup getBKTClient and initializeBKTClient mocks
  (getBKTClient as jest.Mock).mockReturnValue(mockClient);
  (initializeBKTClient as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  (getBKTClient as jest.Mock).mockReset();
  (initializeBKTClient as jest.Mock).mockReset();
});

describe('Bucketeer React SDK', () => {
  it('exports hello function', () => {
    expect(hello()).toBe('Hello from Bucketeer React Client SDK!');
  });

  it('exports BucketeerProvider', async () => {
    const { BucketeerProvider } = await import('./index');
    expect(BucketeerProvider).toBeDefined();
    expect(typeof BucketeerProvider).toBe('function');
  });

  it('exports hooks', async () => {
    const {
      useBooleanVariation,
      useStringVariation,
      useNumberVariation,
      useObjectVariation,
    } = await import('./index');

    expect(useBooleanVariation).toBeDefined();
    expect(useStringVariation).toBeDefined();
    expect(useNumberVariation).toBeDefined();
    expect(useObjectVariation).toBeDefined();
  });

  describe('BucketeerProvider', () => {
    it('initializes client and provides context', async () => {
      // Render a consumer to check context
      let contextValue: unknown = null;
      function Consumer() {
        contextValue = React.useContext(BucketeerContext);
        return null;
      }
      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <Consumer />
          </BucketeerProvider>
        );
      });
      // The context should be defined and have expected shape
      expect(contextValue).toHaveProperty('client');
      expect(contextValue).toHaveProperty('lastUpdated');
      // destroyBKTClient should have been called to clear any previous client
      expect(destroyBKTClient).toHaveBeenCalledTimes(1);
    });

    it('handles invalid config gracefully', async () => {
      // Simulate initializeBKTClient throwing an error
      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid config')
      );
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      let contextValue: unknown = null;
      function Consumer() {
        contextValue = React.useContext(BucketeerContext);
        return null;
      }
      const invalidConfig = {} as BKTConfig;
      await act(async () => {
        render(
          <BucketeerProvider config={invalidConfig} user={mockUser}>
            <Consumer />
          </BucketeerProvider>
        );
      });
      // Should log error and provide null client
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Bucketeer client'),
        expect.any(Error)
      );
      expect((contextValue as { client: unknown }).client).toBeNull();
      errorSpy.mockRestore();
    });

    it('handles invalid user gracefully', async () => {
      (initializeBKTClient as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid user')
      );
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      let contextValue: unknown = null;
      function Consumer() {
        contextValue = React.useContext(BucketeerContext);
        return null;
      }
      const invalidUser = {} as BKTUser;
      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={invalidUser}>
            <Consumer />
          </BucketeerProvider>
        );
      });
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Bucketeer client'),
        expect.any(Error)
      );
      expect((contextValue as { client: unknown }).client).toBeNull();
      errorSpy.mockRestore();
    });

    it('should handle slow initializeBKTClient (500ms delay) gracefully', async () => {
      jest.useFakeTimers();
      (initializeBKTClient as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      let contextValue: unknown = null;
      function Consumer() {
        contextValue = React.useContext(BucketeerContext);
        return null;
      }
      await act(async () => {
        render(
          <BucketeerProvider config={mockConfig} user={mockUser}>
            <Consumer />
          </BucketeerProvider>
        );
      });
      // Before timers run, client should be null (still loading)
      expect((contextValue as { client: unknown }).client).toBeNull();
      // Fast-forward timers by 500ms
      await act(async () => {
        jest.advanceTimersByTime(500);
        await Promise.resolve(); // flush microtasks
      });
      // After timers, client should be set
      expect((contextValue as { client: unknown }).client).toBe(mockClient);
      jest.useRealTimers();
    });

    it('should throw error when nested BucketeerProvider', async () => {
      function Consumer() {
        return null;
      }
      try {
        await act(async () => {
          render(
            <BucketeerProvider config={mockConfig} user={mockUser}>
              <BucketeerProvider config={mockConfig} user={mockUser}>
                <Consumer />
              </BucketeerProvider>
            </BucketeerProvider>
          );
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          'Nested BucketeerProvider is not supported. BucketeerProvider should not be used inside another BucketeerProvider'
        );
      }
    });
  });

  describe('BucketeerProvider2', () => {
    it('initializes client and provides context 2', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BucketeerProvider2 client={mockClient}>{children}</BucketeerProvider2>
      );

      const { result } = renderHook(() => useContext(BucketeerContext), {
        wrapper,
      });

      expect(result.current).toHaveProperty('client', mockClient);
      expect(result.current).toHaveProperty('lastUpdated');
      expect(typeof result.current.lastUpdated).toBe('number');
    });
  });
});
