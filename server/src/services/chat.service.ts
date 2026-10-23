import { openai } from '../config/openai.js';
import { env } from '../config/env.js';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function* streamReply(messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
  if (!openai) {
    yield 'OpenAI is not configured. Add OPENAI_API_KEY to the server environment to enable live responses.';
    return;
  }
  const stream = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages,
    stream: true,
    temperature: 0.3
  }, { signal });
  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
