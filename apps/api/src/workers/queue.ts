import { Queue } from "bullmq";
// import { redisconnection } from "../db/config.js";
import { Redis } from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,

});

export const queue = new Queue('triage',
    { connection: redis })


