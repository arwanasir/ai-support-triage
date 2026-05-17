
export const config = {
    db_url: process.env.DATABASE_URL,
}

// TODO(arwa): one boot-blocker left here. `redisconnection` is being
// spread into `new Redis({...})` in lib/redis.ts, but `redis_url` is not
// a valid ioredis option. ioredis silently ignores unknown keys, then
// defaults to localhost:6379. Inside the app container that's the
// container itself, not the `redis` service, so the app crashes on boot
// with `ECONNREFUSED 127.0.0.1:6379`.
//
// Two valid shapes, pick one and stick with it:
//
//   A. Host/port object (what was here before):
//        export const redisconnection = {
//            host: process.env.REDIS_HOST || 'localhost',
//            port: Number(process.env.REDIS_PORT) || 6379,
//        };
//      and add REDIS_HOST=redis / REDIS_PORT=6379 to .env.example.
//
//   B. Connection URL string. ioredis accepts a `redis://` URL as its
//      first positional arg, so change lib/redis.ts to:
//        export const redis = new Redis(process.env.REDIS_URL!, {
//            maxRetriesPerRequest: null,
//        });
//      and you can delete `redisconnection` entirely.
//
// Either works; (B) is fewer moving parts since .env already has
// REDIS_URL. Also: please delete the old multi-paragraph TODO that
// used to live in this file (it's already addressed).
export const redisconnection = {
    redis_url: process.env.REDIS_URL

}
