import * as migration_20260418_120338_init_auth from './20260418_120338_init_auth';
import * as migration_20260418_123123_add_customers from './20260418_123123_add_customers';
import * as migration_20260419_100039_add_media_types from './20260419_100039_add_media_types';
import * as migration_20260419_100729_add_media_items from './20260419_100729_add_media_items';
import * as migration_20260419_100812_add_external_ids from './20260419_100812_add_external_ids';
import * as migration_20260419_165648_add_release_date_to_media_items from './20260419_165648_add_release_date_to_media_items';
import * as migration_20260419_180857_add_collections from './20260419_180857_add_collections';
import * as migration_20260419_180940_add_collection_items from './20260419_180940_add_collection_items';

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
  {
    up: migration_20260419_100729_add_media_items.up,
    down: migration_20260419_100729_add_media_items.down,
    name: '20260419_100729_add_media_items',
  },
  {
    up: migration_20260419_100812_add_external_ids.up,
    down: migration_20260419_100812_add_external_ids.down,
    name: '20260419_100812_add_external_ids',
  },
  {
    up: migration_20260419_165648_add_release_date_to_media_items.up,
    down: migration_20260419_165648_add_release_date_to_media_items.down,
    name: '20260419_165648_add_release_date_to_media_items',
  },
  {
    up: migration_20260419_180857_add_collections.up,
    down: migration_20260419_180857_add_collections.down,
    name: '20260419_180857_add_collections',
  },
  {
    up: migration_20260419_180940_add_collection_items.up,
    down: migration_20260419_180940_add_collection_items.down,
    name: '20260419_180940_add_collection_items',
  },
];
