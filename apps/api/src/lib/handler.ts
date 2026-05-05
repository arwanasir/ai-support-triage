import { getExistingTicket,createAndCasheTicket } from "./tickets.js";
import { FastifyRequest,FastifyReply } from "fastify";

export async function requestHandler(req:FastifyRequest,reply:FastifyReply){
    try{

        const rawKey = req.headers['idempotency-key'];
        if (!rawKey || Array.isArray(rawKey)) {
            return reply.code(400).send({ error: "Missing or invalid Idempotency-Key header" });
        }
        const existing = await getExistingTicket(rawKey);
        if(existing) return reply.code(200).send({
            'ticket_id':existing.id,
            'status':'queued'
        });

        if (!req.body) {
            return reply.code(400).send({ error: "Request body is missing" });
        }

        const result = await createAndCasheTicket(rawKey,req.body);
        if(result) return reply.code(200).send({
            'ticket_id':result.id,
            'status':'queued'
        });
    }
    catch(error:any){
        if (error.message === "VALIDATION_ERROR") {
                return reply.code(400).send({ error: "Invalid ticket data" });
        }
        console.error(error);
        return reply.code(500).send({error: error.message,stack:error.stack})
    }
   

}