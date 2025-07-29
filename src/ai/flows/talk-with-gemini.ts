'use server';

/**
 * @fileOverview Provides a flow for chatting about a book.
 *
 * - talkWithGemini - A function that returns a complete response based on chat history and book context.
 * - TalkWithGeminiInput - The input type for the talkWithGemini function.
 */

import { ai } from '@/ai/genkit';
import { z, Message } from 'genkit';

const TalkWithGeminiInputSchema = z.object({
  history: z.array(z.custom<Message>()),
  book: z.object({
    title: z.string(),
    author: z.string(),
  }),
});
export type TalkWithGeminiInput = z.infer<typeof TalkWithGeminiInputSchema>;

export async function talkWithGemini(input: TalkWithGeminiInput): Promise<string> {
  return talkWithGeminiFlow(input);
}

export const talkWithGeminiFlow = ai.defineFlow(
  {
    name: 'talkWithGeminiFlow',
    inputSchema: TalkWithGeminiInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, book }) => {
    const systemPrompt = `You are a helpful and knowledgeable assistant. The user wants to talk about the book "${book.title}" by ${book.author}. Engage in a conversation about the book.`;
    
    // Use the non-streaming generate method
    const response = await ai.generate({
      messages: history,
      system: systemPrompt,
    });
    
    return response.text;
  }
);
