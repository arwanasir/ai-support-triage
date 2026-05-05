import { Queue } from "bullmq";
import { redisconnection } from "../db/config.js";

export const queue = new Queue('triage', 
    {connection:redisconnection})