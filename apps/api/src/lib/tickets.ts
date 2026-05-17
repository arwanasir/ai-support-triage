import { db } from '../db/index.js';
import { tickets } from '../db/schema.js';
import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';
import { queue } from '../workers/queue.js';
import { redis } from '../lib/redis.js'

// TODO(arwa): this `ticketSchema` is a duplicate of the body schema you
// already declared in routes/tickets.ts. Fastify validates the body
// against the route schema BEFORE this handler runs, so re-parsing here
// is wasted work and a second source of truth (if you change one, you
// have to remember to change the other).
//
// Refactor: create `src/lib/schemas.ts`, export ONE `ticketBodySchema`
// (and the inferred type), and import it both in the route and here.
// Same DRY idea applies to the `replySchema` that's currently duplicated
// across routes/tickets.ts and lib/handler.ts.
const ticketSchema = z.object({
    subject: z.string(),
    body: z.string(),
    customer_email: z.string().email(),
})
type Ticket = InferSelectModel<typeof tickets>;
console.log("Incoming request hit");



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

    const validateData = ticketSchema.parse(ticketData);
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