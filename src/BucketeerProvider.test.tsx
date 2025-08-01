import React, { useContext } from 'react';
import { renderHook } from '@testing-library/react';
import { BucketeerContext } from './index';
import {
  BKTClient,
  getBKTClient,
  initializeBKTClient,
} from '@bucketeer/js-client-sdk';
import { BucketeerProvider } from './BucketeerProvider';

// Mock global fetch before any SDK code runs
(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

// Mock only specific functions from bkt-js-client-sdk
jest.mock('@bucketeer/js-client-sdk', () => {
  const actual = jest.requireActual('@bucketeer/js-client-sdk');
  return {
    ...actual,
    getBKTClient: jest.fn(),
    initializeBKTClient: jest.fn(),
    destroyBKTClient: jest.fn(),
  };
});

// Use helpers to create valid config and user with mocked fetch and storage
let mockClient: BKTClient;

beforeEach(() => {
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
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BucketeerProvider client={mockClient}>{children}</BucketeerProvider>
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
