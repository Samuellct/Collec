import * as migration_20260418_120338_init_auth from './20260418_120338_init_auth';

export const migrations = [
  {
    up: migration_20260418_120338_init_auth.up,
    down: migration_20260418_120338_init_auth.down,
    name: '20260418_120338_init_auth'
  },
];
