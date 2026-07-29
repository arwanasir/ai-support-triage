import { z } from 'zod';

export const GetTicketsSchema = {
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
  }),
  response: {
    200: z.object({
      items: z.array(z.any()),
      meta: z.object({
        totalCount: z.number(),
        totalPages: z.number(),
        currentPage: z.number(),
        limit: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean()
      })
    })
  }
};

export const postTicketSchema = z.object({
  subject: z.string(),
  body: z.string(),
  customer_email: z.string().email()
});

export const replySchema = z.object({
  decision: z.enum(["approve", "edit", "reject"]),
  reply_text: z.string().min(1)
});