import { Job, Worker } from "bullmq";
import { Redis } from 'ioredis';
import { ai_runs, dlqJobs, tickets } from "../db/schema.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { ticketAnalyser } from '../ai/ai-service.js'

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,

});

const worker = new Worker('triage', async (job: Job) => {
    const ticket_id = job.data.ticket_id;
    console.log(`processing triage or ticket ${ticket_id}`);

    await db.update(tickets)
        .set({ status: 'triaged' })
        .where(eq(tickets.id, ticket_id));

    console.log(`successfully triaged ticket ${ticket_id}`);
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticket_id));
    if (!ticket) {
        throw new Error('ticket not found');
    }
    const result = await ticketAnalyser(
        ticket.subject,
        ticket.body
    );

    await db.update(tickets).set({
        category: result.analysis.category,
        priority: result.analysis.priority,
        sentiment: result.analysis.sentiment,
        draftReply: result.analysis.suggested_reply,
        status: 'awaiting_review'
    }).where(eq(tickets.id, ticket_id));

    await db.insert(ai_runs).values({
        ticketId: ticket_id,
        model: result.model,
        promptHash: '',
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        responseJson: result.responseJson
    });
    console.log(`ticket ${ticket_id} successfully analyzed`);
},
    { connection: redis }
);

worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {

        console.log(`Job ${job.id} exhausted all retries. Moving to DLQ`);
        await db.insert(dlqJobs).values({
            ticketId: job.data.ticket_id as string,
            jobId: String(job.id),
            errorMessage: err.message,
            failedAt: new Date()
        });
    }
});