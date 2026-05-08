import { z } from 'zod';


export const aiOutputSchema = z.object({
  category: z.enum(["billing", "technical", "account", "feature_request", "other"]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  sentiment: z.enum(['positive', 'neutral', 'negative']), // ?
  suggested_reply: z.string()
});

type AIAnalysis = z.infer<typeof aiOutputSchema>;


export type AIServiceResult = {
  analysis: AIAnalysis;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  responseJson: unknown;
};
export type AIAnalysis = z.infer<typeof aiOutputSchema>;
