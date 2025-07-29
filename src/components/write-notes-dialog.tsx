"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Book } from '@/lib/types';
import { Label } from '@/components/ui/label';

interface WriteNotesDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string) => void;
}

export function WriteNotesDialog({ book, isOpen, onOpenChange, onSave }: WriteNotesDialogProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotes(book.notes || '');
    }
  }, [isOpen, book.notes]);

  const handleSave = () => {
    onSave(notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notes for {book.title}</DialogTitle>
          <DialogDescription>
            Add or edit your personal notes for this book.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
