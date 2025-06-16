import { defineBKTConfig, type RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { defineBKTConfigForReact } from './BKTConfig';
import { SDK_VERSION } from './version';

// Mock global fetch before any SDK code runs
(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

describe('defineBKTConfigForReact', () => {
  it('should set correct wrapperSdkSourceId and wrapperSdkVersion while preserving other fields', () => {
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
    };

    // Get config from defineBKTConfigForReact
    const reactConfig = defineBKTConfigForReact(inputConfig);

    // React config should have the wrapper SDK fields set correctly
    expect(reactConfig.wrapperSdkSourceId).toBe(SOURCE_ID_REACT);
    expect(reactConfig.wrapperSdkVersion).toBe(SDK_VERSION);

    // We use a "spy config" here to ensure our wrapper function does not accidentally
    // remove or alter any fields from the original config. By comparing the output of
    // defineBKTConfigForReact to the result of defineBKTConfig with the expected wrapper
    // fields added, we guarantee that all original data is preserved and only the intended
    // wrapperSdkSourceId and wrapperSdkVersion fields are set/overridden. This acts as a
    // safeguard against accidental changes during future refactoring.
    // This approach is not required setup mock.
    const spyConfig = defineBKTConfig({
      ...inputConfig,
      wrapperSdkSourceId: SOURCE_ID_REACT,
      wrapperSdkVersion: SDK_VERSION,
    } satisfies RawBKTConfig);
    expect(reactConfig).toEqual(spyConfig);
  });

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
      // These should be overridden
      wrapperSdkSourceId: 999,
      wrapperSdkVersion: 'old-version',
    };

    const reactConfig = defineBKTConfigForReact(inputConfig);
    const { sourceId, sdkVersion } = reactConfig as unknown as {
      // internal fields
      sdkVersion: string;
      sourceId: number;
    };
    // Should override with React-specific values
    expect(reactConfig.wrapperSdkSourceId).toBe(SOURCE_ID_REACT);
    expect(reactConfig.wrapperSdkVersion).toBe(SDK_VERSION);
    // Original values should not be present
    expect(sourceId).toBe(SOURCE_ID_REACT);
    expect(sdkVersion).toBe(SDK_VERSION);
  });
});
