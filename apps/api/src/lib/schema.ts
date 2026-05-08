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