"use client";

import { useState, useEffect } from 'react';
import { suggestRelatedBooks } from '@/ai/flows/suggest-related-books';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface RelatedBooksDialogProps {
  bookTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RelatedBooksDialog({ bookTitle, isOpen, onOpenChange }: RelatedBooksDialogProps) {
  const [relatedBooks, setRelatedBooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchRelatedBooks = async () => {
        setIsLoading(true);
        setError(null);
        setRelatedBooks([]);
        try {
          const result = await suggestRelatedBooks({ title: bookTitle });
          setRelatedBooks(result.relatedBooks);
        } catch (e) {
          setError('Could not fetch recommendations. Please try again later.');
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRelatedBooks();
    }
  }, [isOpen, bookTitle]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Books related to "{bookTitle}"</DialogTitle>
          <DialogDescription>
            Here are some AI-powered recommendations you might also enjoy.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-5/6" />
            </div>
          )}
          {error && (
             <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && (
            <ul className="space-y-2 list-disc list-inside">
              {relatedBooks.map((title, index) => (
                <li key={index} className="text-foreground/90">{title}</li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
