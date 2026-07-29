import { db } from '../db/index.js';
import { tickets } from '../db/schema.js';
import { InferSelectModel } from 'drizzle-orm';
import { queue } from '../workers/queue.js';
import { redis } from '../lib/redis.js';
import { postTicketSchema } from '../lib/schema.js';


type Ticket = InferSelectModel<typeof tickets>;




export async function getExistingTicket(key: string): Promise<Ticket | null> {
    try {
        const cashed = await redis.get(`idempotency-key:${key}`);
        if (cashed) {
            return JSON.parse(cashed);
        }
        return null;

    }
    catch (err: any) {
        console.error({ error: err.message });
        return null;
    }

};

export async function createAndCasheTicket(key: string, ticketData: unknown): Promise<Ticket | null> {

    const reserved = await redis.set(
        `idempotency-lock:${key}`,
        "processing",
        "EX",
        60,
        "NX"
    );

    if (!reserved) {
        throw new Error("Duplicate request is already processing");
    }

    const validateData = postTicketSchema.parse(ticketData);
    const [newTicket] = await db.insert(tickets).values({
        subject: validateData.subject,
        body: validateData.body,
        customerEmail: validateData.customer_email,


    }).returning();


    if (!newTicket) {
        throw new Error("Failed to create ticket: No data returned from database");
    }
    await queue.add('triage', { ticket_id: newTicket.id },
        {
            attempts: 4,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        }
    );

    await redis.set(
        `idempotency-key:${key}`,
        JSON.stringify(newTicket),
        `EX`,
        86400
    )

    return newTicket;

}