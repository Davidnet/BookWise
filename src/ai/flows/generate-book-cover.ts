'use server';

/**
 * @fileOverview Provides a flow to generate a book cover image using AI.
 * 
 * - generateBookCover - A function that generates a book cover based on its title and author.
 * - GenerateBookCoverInput - The input type for the generateBookCover function.
 * - GenerateBookCoverOutput - The return type for the generateBookCover function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { uploadImage } from '@/services/storage-service';

const GenerateBookCoverInputSchema = z.object({
    title: z.string().describe('The title of the book.'),
    author: z.string().describe('The author of the book.'),
    bookId: z.string().describe('The ID of the book.'),
});
export type GenerateBookCoverInput = z.infer<typeof GenerateBookCoverInputSchema>;

const GenerateBookCoverOutputSchema = z.object({
    coverImageUrl: z.string().describe("The public URL of the generated book cover image in Firebase Storage."),
});
export type GenerateBookCoverOutput = z.infer<typeof GenerateBookCoverOutputSchema>;

export async function generateBookCover(input: GenerateBookCoverInput): Promise<GenerateBookCoverOutput> {
    return generateBookCoverFlow(input);
}

const generateBookCoverFlow = ai.defineFlow(
    {
        name: 'generateBookCoverFlow',
        inputSchema: GenerateBookCoverInputSchema,
        outputSchema: GenerateBookCoverOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a book cover for "${input.title}" by ${input.author}. The style should be artistic and evocative of the book's themes. The title and author's name must be clearly visible. Do not include any other text.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        if (!media || !media.url) {
            throw new Error('Image generation failed.');
        }

        const downloadUrl = await uploadImage(media.url, input.bookId);

        return { coverImageUrl: downloadUrl };
    }
);
