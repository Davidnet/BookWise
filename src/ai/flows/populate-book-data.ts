'use server';

/**
 * @fileOverview Provides a flow to populate book data using AI.
 *
 * - populateBookData - A function that populates book data based on a title.
 * - PopulateBookDataInput - The input type for the populateBookData function.
 * - PopulateBookDataOutput - The return type for the populateBookData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PopulateBookDataInputSchema = z.object({
  title: z.string().describe('The title of the book to populate data for.'),
});
export type PopulateBookDataInput = z.infer<typeof PopulateBookDataInputSchema>;

const PopulateBookDataOutputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  isbn: z.string().describe('The ISBN of the book. Should be a valid ISBN-10 or ISBN-13.'),
});
export type PopulateBookDataOutput = z.infer<typeof PopulateBookDataOutputSchema>;

export async function populateBookData(input: PopulateBookDataInput): Promise<PopulateBookDataOutput> {
  return populateBookDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'populateBookDataPrompt',
  input: {schema: PopulateBookDataInputSchema},
  output: {schema: PopulateBookDataOutputSchema},
  prompt: `You are a helpful assistant. For the book titled "{{title}}", find the author and its ISBN number. Provide a valid ISBN-10 or ISBN-13. Return the result in the requested format.`,
});

const populateBookDataFlow = ai.defineFlow(
  {
    name: 'populateBookDataFlow',
    inputSchema: PopulateBookDataInputSchema,
    outputSchema: PopulateBookDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
