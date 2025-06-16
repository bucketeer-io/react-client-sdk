import { defineBKTConfig } from 'bkt-js-client-sdk';
import { BKTConfig, RawBKTConfig } from 'bkt-js-client-sdk';
import { SOURCE_ID_REACT } from './SourceId';
import { version } from './version';

function defineBKTConfigForReact(config: RawBKTConfig): BKTConfig {
  return defineBKTConfig({
    ...config,
    wrapperSdkSourceId: SOURCE_ID_REACT,
    wrapperSdkVersion: version,
  } satisfies RawBKTConfig);
}

export { defineBKTConfigForReact };
