'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Book } from '@/lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function TalkWithGeminiDialog({
  book,
  isOpen,
  onOpenChange,
}: {
  book: Book;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when dialog is opened
    if (isOpen) {
      setMessages([]);
      setInput('');
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiResponse = await fetch('/api/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          book: {
            title: book.title,
            author: book.author,
          },
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('API response was not ok.');
      }
      
      const { response: assistantResponse } = await apiResponse.json();
      
      const assistantMessage: Message = { role: 'assistant', content: assistantResponse };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error fetching response:', error);
       const errorMessage: Message = { role: 'assistant', content: "Sorry, I couldn't get a response. Please try again." };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Talk with Gemini about {book.title}</DialogTitle>
          <DialogDescription>
            Ask me anything about this book.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[60vh]">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <div className="font-bold w-20 flex-shrink-0">
                    {m.role === 'user' ? 'You:' : 'Gemini:'}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-2">
                   <div className="font-bold w-20 flex-shrink-0">Gemini:</div>
                   <div className="flex-1"><Loader2 className="h-4 w-4 animate-spin"/></div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-4 border-t"
          >
            <Input
              value={input}
              placeholder="Ask a question"
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 mr-4"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
