import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-related-books.ts';
import '@/ai/flows/populate-book-data.ts';
import '@/ai/flows/generate-book-cover.ts';
import '@/ai/flows/talk-with-gemini.ts';
