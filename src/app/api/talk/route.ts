import { talkWithGemini } from '@/ai/flows/talk-with-gemini';
import { Message } from 'genkit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, book } = await req.json();

  const history = messages.map((m: { role: string; content: string }) => {
    const role: 'user' | 'model' = m.role === 'user' ? 'user' : 'model';
    // The history for genkit should not include the latest user message
    if (role === 'model') {
      return {
        role: role,
        content: [{ text: m.content }],
      } as Message;
    }
    // The history for genkit should include the user messages
    return {
      role: 'user',
      content: [{ text: m.content }],
    } as Message;
  });

  try {
    const response = await talkWithGemini({
      history: history,
      book,
    });

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting response:', error);
    return new Response(JSON.stringify({ response: "Sorry, I couldn't get a response. Please try again." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
