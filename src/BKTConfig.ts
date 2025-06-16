import { defineBKTConfig } from 'bkt-js-client-sdk';
import { BKTConfig, RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';

function defineBKTConfigForReact(config: RawBKTConfig): BKTConfig {
  return defineBKTConfig({
    ...config,
    wrapperSdkSourceId: SOURCE_ID_REACT,
    wrapperSdkVersion: __BKT_SDK_VERSION__,
  } satisfies RawBKTConfig);
}

export { defineBKTConfigForReact };
