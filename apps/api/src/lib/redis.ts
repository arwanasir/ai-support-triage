import { Redis } from 'ioredis';
import { redisconnection } from '../db/config.js';

export const redis = new Redis({
    ...redisconnection,
    maxRetriesPerRequest: null
})