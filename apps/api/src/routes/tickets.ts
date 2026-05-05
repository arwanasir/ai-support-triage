import {z} from 'zod';
import { FastifyInstance } from 'fastify';
import { requestHandler } from '../lib/handler.js';


export async function ticketRoutes(fastify:FastifyInstance){
    fastify.route({
        method:'POST',
        url:'/webhooks/tickets',
        schema:{
            body:z.object({
                subject:z.string(),
                body:z.string(),
                customer_email:z.string().email()
            }),
            response:{
                200:z.object({
                    ticket_id: z.string(),
                    status: z.literal('queued')
                })
            }
            
        },handler:requestHandler
    });


}