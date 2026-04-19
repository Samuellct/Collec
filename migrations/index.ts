import * as migration_20260418_120338_init_auth from './20260418_120338_init_auth';
import * as migration_20260418_123123_add_customers from './20260418_123123_add_customers';
import * as migration_20260419_100039_add_media_types from './20260419_100039_add_media_types';

export const migrations = [
  {
    up: migration_20260418_120338_init_auth.up,
    down: migration_20260418_120338_init_auth.down,
    name: '20260418_120338_init_auth',
  },
  {
    up: migration_20260418_123123_add_customers.up,
    down: migration_20260418_123123_add_customers.down,
    name: '20260418_123123_add_customers',
  },
  {
    up: migration_20260419_100039_add_media_types.up,
    down: migration_20260419_100039_add_media_types.down,
    name: '20260419_100039_add_media_types',
  },
];
