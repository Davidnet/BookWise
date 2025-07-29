"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Book } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const assignBorrowerSchema = z.object({
  borrower: z.string().min(2, { message: "Borrower's name must be at least 2 characters." }),
});

type AssignBorrowerFormValues = z.infer<typeof assignBorrowerSchema>;

interface AssignBorrowerDialogProps {
  book: Book;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (borrower: string) => void;
}

export function AssignBorrowerDialog({ book, isOpen, onOpenChange, onAssign }: AssignBorrowerDialogProps) {
  const form = useForm<AssignBorrowerFormValues>({
    resolver: zodResolver(assignBorrowerSchema),
    defaultValues: {
      borrower: '',
    },
  });

  function onSubmit(values: AssignBorrowerFormValues) {
    onAssign(values.borrower);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check Out: {book.title}</DialogTitle>
          <DialogDescription>
            Enter the borrower's name to check out this book.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="borrower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Borrower's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Check Out</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
