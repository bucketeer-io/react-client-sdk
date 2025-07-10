// This test file uses the real implementation of defineBKTConfigForReact and does not mock any modules.
// It is separated from the mock-based test file to avoid Jest module cache issues and to ensure that
// tests using the real implementation are not affected by mocking. See BKTConfig.mock.test.ts for the
// mock-based test that verifies argument passing to the SDK.

import { type RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { defineBKTConfigForReact } from './BKTConfig';
import { SDK_VERSION } from './version';

(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

describe('defineBKTConfigForReact (real implementation)', () => {
  it('should override wrapperSdkSourceId and wrapperSdkVersion if provided in input', () => {
    const inputConfig: RawBKTConfig = {
      apiKey: 'test-api-key',
      apiEndpoint: 'https://api.example.com',
      featureTag: 'test-tag',
      eventsFlushInterval: 30000,
      eventsMaxQueueSize: 100,
      pollingInterval: 60000,
      appVersion: '1.0.0',
      userAgent: 'test-user-agent',
      fetch: globalThis.fetch,
      storageFactory: jest.fn(),
      wrapperSdkSourceId: 999,
      wrapperSdkVersion: 'old-version',
    };
    const reactConfig = defineBKTConfigForReact(inputConfig);
    // Check sourceId and sdkVersion by casting to the expected type,
    // because their properties are not directly available on the RawBKTConfig type.
    // It is private.
    const { sourceId, sdkVersion } = reactConfig as unknown as {
      sdkVersion: string;
      sourceId: number;
    };
    expect(reactConfig.wrapperSdkSourceId).toBe(SOURCE_ID_REACT);
    expect(reactConfig.wrapperSdkVersion).toBe(SDK_VERSION);
    expect(reactConfig.userAgent).toBe(`Bucketeer React SDK(${SDK_VERSION})`);
    expect(sourceId).toBe(SOURCE_ID_REACT);
    expect(sdkVersion).toBe(SDK_VERSION);
  });
});
