import {drizzle} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import {config} from './config.js';

const pool  = new Pool({
    connectionString: config.db_url
});

export const db = drizzle(pool,{schema})