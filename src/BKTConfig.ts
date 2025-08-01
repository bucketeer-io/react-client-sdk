import { defineBKTConfig } from '@bucketeer/js-client-sdk';
import type { BKTConfig, RawBKTConfig } from '@bucketeer/js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { SDK_VERSION } from './version';

function defineBKTConfigForReact(config: RawBKTConfig): BKTConfig {
  return defineBKTConfig({
    ...config,
    // Override wrapper SDK fields for React
    // These fields are required for the React SDK to function correctly
    // They will be overridden if provided in the input config
    // to make sure we use the correct source ID and version
    wrapperSdkSourceId: SOURCE_ID_REACT,
    wrapperSdkVersion: SDK_VERSION,
    userAgent: `Bucketeer React SDK(${SDK_VERSION})`,
  } satisfies RawBKTConfig);
}

export { defineBKTConfigForReact };
