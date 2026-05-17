import { Queue } from "bullmq";
import { redis } from '../lib/redis.js';



export const queue = new Queue('triage',
    { connection: redis })


