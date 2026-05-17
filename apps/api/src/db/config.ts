
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
//   export const redis = new Redis({
//       ...redisconnection,
//       maxRetriesPerRequest: null, // required by BullMQ Workers
//   });
// and then in all three files above, replace the inline `new Redis(...)`
// with `import { redis } from '../lib/redis.js';`. ONE client, configured
// in ONE place, shared everywhere.
//
// Why `maxRetriesPerRequest: null`? BullMQ Workers use blocking Redis
// commands (BRPOP) and refuse to start if the connection might give up
// on a request mid-block. With 3 separate connections you sometimes get
// away with not setting it; the moment you share ONE client across the
// Queue, the Worker, and the idempotency cache, BullMQ enforces it and
// the app crashes on boot. Set it once, here, done.
export const redisconnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
}