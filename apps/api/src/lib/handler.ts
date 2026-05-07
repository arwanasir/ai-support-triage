import { getExistingTicket,createAndCasheTicket } from "./tickets.js";
import { FastifyRequest,FastifyReply } from "fastify";
import { db } from '../db/index.js';
import { tickets } from '../db/schema.js';
import { ilike, sql, desc } from 'drizzle-orm';

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
   

};


export async function getTicketsHandler(request:FastifyRequest) {
  const { page: pageStr, limit: limitStr, search } = request.query as { page: string; limit: string; search?: string };
  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);
  const offset = (page - 1) * limit;

  // Simple search filter
  const filters = search ? ilike(tickets.subject, `%${search}%`) : undefined;

  // Fetch data and total count at the same time
  const [data, totalResult] = await Promise.all([
    db.select()
      .from(tickets)
      .where(filters)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tickets.createdAt)),
    db.select({ count: sql<number>`count(*)` })
      .from(tickets)
      .where(filters)
  ]);

  const totalCount = Number(totalResult?.[0]?.count ?? 0);
  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: data,
    meta: {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};