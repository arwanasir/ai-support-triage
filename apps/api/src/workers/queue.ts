import { Queue } from "bullmq";
// import { redisconnection } from "../db/config.js";
import { Redis } from 'ioredis';

// TODO(arwa): replace these 5 lines with:
//   import { redis } from '../lib/redis.js';
// See db/config.ts for the full pattern. (Copy 2 of 3.)
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,

});

export const queue = new Queue('triage',
    { connection: redis })


