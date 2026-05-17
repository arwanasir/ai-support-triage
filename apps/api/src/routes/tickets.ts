import { z } from 'zod';
import { FastifyInstance } from 'fastify';
import { requestHandler, getTicketsHandler, replyHandler } from '../lib/handler.js';
import { GetTicketsSchema, replySchema, postTicketSchema } from '../lib/schema.js';


export async function ticketRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'POST',
        url: '/webhooks/tickets',
        schema: {
            body: postTicketSchema,
            response: {
                200: z.object({
                    ticket_id: z.string(),
                    status: z.literal('queued')
                })
            }

        }, handler: requestHandler
    });
    fastify.route({
        method: 'GET',
        url: '/tickets',
        schema: GetTicketsSchema,
        handler: getTicketsHandler
    });

    fastify.route({
        method: 'POST',
        url: "/tickets/:id/reply",
        schema: {
            params: z.object({
                id: z.string().uuid(),

            }),
            body: replySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    status: z.string()
                })
            }
        },
        handler: replyHandler

    })


}