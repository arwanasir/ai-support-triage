import Anthropic from "@anthropic-ai/sdk";
import {aiOutputSchema,AIServiceResult} from './ai-schema.js';
import {buildTriagePrompt} from './prompts.js'

const anthropic = new Anthropic({
    apiKey:process.env.ANTHROPIC_API_KEY,
    timeout:15000
})

export async function ticketAnalyser(subject:string,body:string):Promise<AIServiceResult>{
    const prompt = buildTriagePrompt(subject,body);
    const start = Date.now();
    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
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
    const latencyMs = Date.now()-start;

    const rawInput = response.content.filter((block)=>block.type == 'text').map((block)=> block.text).join('');

    if(!rawInput){
        throw new Error('claude returned an empty response');
    }

    const parsed = JSON.parse(rawInput);
    const validated = aiOutputSchema.parse(parsed);

    return {
        analysis: validated,
        model:response.model,
        inputTokens:response.usage.input_tokens,
        outputTokens:response.usage.output_tokens,
        latencyMs,
        responseJson:parsed
    }
}


