import type { BKTClient, BKTConfig, BKTUser } from 'bkt-js-client-sdk';
import {
  getBKTClient,
  initializeBKTClient,
  defineBKTUser,
} from 'bkt-js-client-sdk';
import React from 'react';
import { BucketeerProvider } from '../index';
import { render, act } from '@testing-library/react';

export function createMockConfig(): BKTConfig {
  return {
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
  } as BKTConfig;
}

export function createMockUser(): BKTUser {
  return defineBKTUser({
    id: 'user-1',
    customAttributes: { foo: 'bar' },
  });
}

export function createMockClient(variationMethod: string): BKTClient {
  return {
    [variationMethod]: jest.fn(),
    addEvaluationUpdateListener: jest
      .fn()
      .mockReturnValue('mock-listener-token'),
    removeEvaluationUpdateListener: jest.fn(),
    updateUserAttributes: jest.fn(),
  } as unknown as BKTClient;
}

export function createTestSuite(variationMethod: string): {
  mockConfig: BKTConfig;
  mockUser: BKTUser;
  mockClient: BKTClient;
  setupAsync: (children: React.ReactNode) => Promise<ReturnType<typeof render>>;
} {
  const mockConfig = createMockConfig();
  const mockUser = createMockUser();
  const mockClient = createMockClient(variationMethod);

  (getBKTClient as jest.Mock).mockReturnValue(mockClient);
  (initializeBKTClient as jest.Mock).mockResolvedValue(undefined);

  const setupAsync = async (children: React.ReactNode) => {
    let renderResult: ReturnType<typeof render>;
    await act(async () => {
      renderResult = render(
        <BucketeerProvider config={mockConfig} user={mockUser}>
          {children}
        </BucketeerProvider>
      );
    });
    return renderResult!;
  };

  return { mockConfig, mockUser, mockClient, setupAsync };
}
