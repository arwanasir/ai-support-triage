
export const config = {
    db_url: process.env.DATABASE_URL,
}

// TODO(arwa): the shape of `redisconnection` (host + port) is the right
// idea — but right now it's unused. Every file that needs Redis is
// creating its OWN `new Redis({host, port})` (see lib/tickets.ts,
// workers/queue.ts, workers/workers.ts — three copies).
//
// Refactor: create a new file `src/lib/redis.ts` that does
//   import { Redis } from 'ioredis';
//   import { redisconnection } from '../db/config.js';
//   export const redis = new Redis(redisconnection);
// and then in all three files above, replace the inline `new Redis(...)`
// with `import { redis } from '../lib/redis.js';`. ONE client, configured
// in ONE place, shared everywhere.
export const redisconnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
}