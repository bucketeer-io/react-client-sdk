// This test file uses a mock for defineBKTConfig to verify that defineBKTConfigForReact
// passes the correct arguments to the underlying SDK. We separate this from the real
// implementation test to avoid issues with Jest's module cache and to ensure isolation.
// See BKTConfig.real.test.ts for tests using the real implementation.
jest.mock('bkt-js-client-sdk', () => ({
  defineBKTConfig: jest.fn(),
}));

import { RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { SDK_VERSION } from './version';
import { defineBKTConfigForReact } from './BKTConfig';

(globalThis as unknown as { fetch: jest.Mock }).fetch = jest.fn();

// Get the mocked function after imports
const { defineBKTConfig } = jest.requireMock('bkt-js-client-sdk');
const mockDefineBKTConfig = defineBKTConfig as jest.MockedFunction<
  typeof defineBKTConfig
>;

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('defineBKTConfigForReact (mocked defineBKTConfig)', () => {
  beforeEach(() => {
    mockDefineBKTConfig.mockClear();
    mockDefineBKTConfig.mockImplementation((cfg: RawBKTConfig) => ({ ...cfg }));
  });

  it('should call defineBKTConfig with all required config fields and override wrapper fields', async () => {
    const inputConfig = {
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
      wrapperSdkSourceId: 123,
      wrapperSdkVersion: 'old-version',
    };
    defineBKTConfigForReact(inputConfig);
    expect(mockDefineBKTConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        ...inputConfig,
        wrapperSdkSourceId: SOURCE_ID_REACT,
        wrapperSdkVersion: SDK_VERSION,
        userAgent: `Bucketeer React SDK(${SDK_VERSION})`,
      })
    );
  });
});
