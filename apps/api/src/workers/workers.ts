import { Job, Worker } from "bullmq";
import { redisconnection } from "../db/config.js";
import { tickets } from "../db/schema.js"; 
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";

const worker = new Worker('triage',async(job) =>{
    const ticket_id = job.data.ticket_id;
    console.log(`processing triage or ticket ${ticket_id}`);

    await db.update(tickets)
    .set({status:'triaged'})
    .where(eq(tickets.id,ticket_id));

    console.log(`successfully triaged ticket ${ticket_id}`);  
},
    {connection:redisconnection}
);

worker.on('failed',(job,err) =>{
    console.error(`job ${job?.id} failed with error:${err.message}`)
})