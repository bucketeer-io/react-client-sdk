import { defineBKTConfig } from 'bkt-js-client-sdk';
import type { BKTConfig, RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { SDK_VERSION } from './version';

function defineBKTConfigForReact(config: RawBKTConfig): BKTConfig {
  return defineBKTConfig({
    ...config,
    wrapperSdkSourceId: SOURCE_ID_REACT,
    wrapperSdkVersion: SDK_VERSION,
  } satisfies RawBKTConfig);
}

export { defineBKTConfigForReact };
