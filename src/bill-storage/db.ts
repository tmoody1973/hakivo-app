import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { DB } from '../db/hakivoDb/types';
import type { Env } from './raindrop.gen';

/**
 * Get database connection
 */
export function getDb(env: Env): Kysely<DB> {
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: env.HAKIVO_DB as any }),
  });
}
