import Anthropic from "@anthropic-ai/sdk";
import { aiOutputSchema, AIServiceResult } from './ai-schema.js';
import { buildTriagePrompt } from './prompts.js'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 15000
});

export async function ticketAnalyser(subject: string, body: string): Promise<AIServiceResult> {
    const prompt = buildTriagePrompt(subject, body);
    const start = Date.now();
    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        temperature: 0.2,
        system:
            "You are a support ticket triage assistant that ONLY returns valid JSON.",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],

    })
    const latencyMs = Date.now() - start;

    const rawInput = response.content.filter((block) => block.type == 'text').map((block) => block.text).join('');

    if (!rawInput) {
        throw new Error('claude returned an empty response');
    }

    const jsonMatch = rawInput.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
        throw new Error("Claude did not return valid JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = aiOutputSchema.parse(parsed);

    return {
        analysis: validated,
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        latencyMs,
        responseJson: parsed
    }
}


