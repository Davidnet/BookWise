'use server';

/**
 * @fileOverview Provides book recommendations based on a given book title.
 *
 * - suggestRelatedBooks - A function that suggests related books based on a title.
 * - SuggestRelatedBooksInput - The input type for the suggestRelatedBooks function.
 * - SuggestRelatedBooksOutput - The return type for the suggestRelatedBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedBooksInputSchema = z.object({
  title: z.string().describe('The title of the book to find related books for.'),
});
export type SuggestRelatedBooksInput = z.infer<typeof SuggestRelatedBooksInputSchema>;

const SuggestRelatedBooksOutputSchema = z.object({
  relatedBooks: z.array(z.string()).describe('A list of related book titles.'),
});
export type SuggestRelatedBooksOutput = z.infer<typeof SuggestRelatedBooksOutputSchema>;

export async function suggestRelatedBooks(input: SuggestRelatedBooksInput): Promise<SuggestRelatedBooksOutput> {
  return suggestRelatedBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedBooksPrompt',
  input: {schema: SuggestRelatedBooksInputSchema},
  output: {schema: SuggestRelatedBooksOutputSchema},
  prompt: `You are a librarian. A user is looking at a book titled "{{title}}". Suggest other books a reader might be interested in. Return a list of book titles. Limit the number of suggestions to 5.`,
});

const suggestRelatedBooksFlow = ai.defineFlow(
  {
    name: 'suggestRelatedBooksFlow',
    inputSchema: SuggestRelatedBooksInputSchema,
    outputSchema: SuggestRelatedBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
