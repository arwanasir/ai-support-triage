import { getExistingTicket,createAndCasheTicket } from "./tickets.js";
import { FastifyRequest,FastifyReply } from "fastify";
import {success, z} from "zod";
import { db } from "../db/index.js";
import { agents_action, tickets } from "../db/schema.js";
import { eq } from "drizzle-orm";

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

 const replySchema = z.object({
    decision:z.enum(["approve", "edit", "reject"]),
    reply_text:z.string().min(1)
    });

 type reply_schema = z.infer<typeof replySchema>

export async function replyHandler(request:FastifyRequest,reply:FastifyReply){
    const {id} = request.params as {id:string};
    const {decision,reply_text} = request.body as reply_schema;
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id,id));
    if(!ticket){
        throw new Error("ticket not found");
    }
    const newStatus = decision === "reject" ? "closed" : "sent";
    await db.insert(agents_action).values({
        toolName:decision,
        input:{
            ticket_id:id
        },
        output:{
            reply_text
        }
    });
    await db.update(tickets).set({
        status:newStatus,
        draftReply:reply_text
    }).where(eq(tickets.id,id));

    return reply.code(200).send({
        success:true,
        status:newStatus
    })
  
}