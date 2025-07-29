"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateBookCover } from '@/ai/flows/generate-book-cover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Terminal } from 'lucide-react';
import type { Book } from '@/lib/types';

interface GenerateCoverDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCoverGenerated: (coverUrl: string) => void;
}

export function GenerateCoverDialog({ book, isOpen, onOpenChange, onCoverGenerated }: GenerateCoverDialogProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(book.coverImageUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCover = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateBookCover({ title: book.title, author: book.author, bookId: book.id });
      setCoverUrl(result.coverImageUrl);
    } catch (e) {
      setError('Could not generate cover. Please try again later.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !coverUrl) {
      fetchCover();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = () => {
    if (coverUrl) {
      onCoverGenerated(coverUrl);
    }
    onOpenChange(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if(!open) {
      setCoverUrl(book.coverImageUrl ?? null);
      setError(null);
      setIsLoading(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Generated Cover for "{book.title}"</DialogTitle>
          <DialogDescription>
            Here is an AI-generated cover. You can save it or try generating a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-center">
          {isLoading ? (
            <div className="space-y-2 w-full aspect-[2/3] flex flex-col items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="w-full">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : coverUrl ? (
            <div className="relative w-full" style={{paddingBottom: '150%'}}>
              <Image src={coverUrl} alt={`AI generated cover for ${book.title}`} layout="fill" className="rounded-lg object-cover" />
            </div>
          ) : (
             <Skeleton className="w-full h-full aspect-[2/3]" />
          )}
        </div>
        <DialogFooter className='mt-4'>
            <Button variant="outline" onClick={() => fetchCover()} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Regenerate
            </Button>
            <Button onClick={handleSave} disabled={!coverUrl || isLoading}>Save Cover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
