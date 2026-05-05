import {db} from '../db/index.js';
import { tickets } from '../db/schema.js';
import { Redis } from 'ioredis';
import { InferSelectModel } from 'drizzle-orm';
import {z} from 'zod';

const ticketSchema = z.object({
    subject:z.string(),
    body:z.string(),
    customer_email:z.string().email(),
})
type Ticket = InferSelectModel<typeof tickets>;
const redis =new Redis(process.env.REDIS_URL!);

export async function getExistingTicket(key:string):Promise<Ticket | null>{
    try{
         const cashed = await redis.get(`idempotency-key:${key}`);
        if(cashed){
            return JSON.parse(cashed);
        }
        return null;

    }
    catch(err:any){
        console.error({error:err.message});
        return null;
    }
   
};

export async function createAndCasheTicket(key:string,ticketData:unknown):Promise<Ticket | null>{
    const validateData = ticketSchema.parse(ticketData);

    const [newTicket] = await db.insert(tickets).values({
        subject:validateData.subject,
        body:validateData.body,
        customerEmail: validateData.customer_email,
    
       
    } as any ).returning();

    if (!newTicket) {
        throw new Error("Failed to create ticket: No data returned from database");
    }

    await redis.set(
        `idempotency-key:${key}`,
        JSON.stringify(newTicket),
        `EX`,
        86400
    )

    return newTicket;
}