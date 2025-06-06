import React from 'react';
import { render } from '@testing-library/react';
import { hello, BucketeerProvider, BucketeerContext } from './index';
import { BKTConfig, BKTUser, defineBKTConfig, defineBKTUser } from 'bkt-js-client-sdk';

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

beforeEach(() => {
  mockConfig = defineBKTConfig({
    apiKey: 'test-api-key',
    apiEndpoint: 'http://test-endpoint',
    featureTag: 'test-tag',
    eventsFlushInterval: 30,
    eventsMaxQueueSize: 100,
    pollingInterval: 60,
    appVersion: '1.0.0',
    userAgent: 'test-agent',
    fetch: jest.fn(),
    storageFactory: jest.fn(),
  });
  mockUser = defineBKTUser({
    id: 'user-1',
    customAttributes: { foo: 'bar' },
  });
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
      let contextValue: any = null;
      function Consumer() {
        contextValue = React.useContext(BucketeerContext);
        return null;
      }
      render(
        <BucketeerProvider config={mockConfig} user={mockUser}>
          <Consumer />
        </BucketeerProvider>
      );
      // The context should be defined and have expected shape
      expect(contextValue).toHaveProperty('client');
      expect(contextValue).toHaveProperty('lastUpdated');
    });
  });
});
