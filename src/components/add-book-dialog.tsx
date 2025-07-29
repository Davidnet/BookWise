"use client";

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import type { Book } from '@/lib/types';
import { populateBookData } from '@/ai/flows/populate-book-data';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const addBookSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  author: z.string().min(2, { message: "Author must be at least 2 characters." }),
  isbn: z.string().regex(/^(97(8|9))?\d{9}(\d|X)$/, { message: "Please enter a valid ISBN-10 or ISBN-13." }),
});

type AddBookFormValues = z.infer<typeof addBookSchema>;

interface AddBookDialogProps {
  children: ReactNode;
  onBookAdd: (book: Omit<Book, 'id' | 'status' | 'likes' | 'dislikes' | 'notes'>) => Promise<void>;
}

export function AddBookDialog({ children, onBookAdd }: AddBookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiBookTitle, setAiBookTitle] = useState('');
  const { toast } = useToast();
  
  const form = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
    },
  });

  async function onSubmit(values: AddBookFormValues) {
    setIsSubmitting(true);
    try {
      await onBookAdd(values);
      toast({
        title: "Book Added",
        description: `"${values.title}" has been added to the library.`,
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to add the book. Please try again.",
      });
      console.error("Failed to add book:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAiPopulate = async () => {
    if (!aiBookTitle) return;
    setAiLoading(true);
    try {
      const result = await populateBookData({ title: aiBookTitle });
      form.setValue('title', result.title);
      form.setValue('author', result.author);
      form.setValue('isbn', result.isbn.replace(/-/g, ''));
      toast({
        title: "AI populated book data!",
        description: `Successfully fetched data for "${result.title}".`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "AI failed",
        description: "Could not populate book data.",
      });
      console.error(error);
    } finally {
      setAiLoading(false);
      setAiDialogOpen(false);
      setAiBookTitle('');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a New Book</DialogTitle>
            <DialogDescription>
              Enter the details of the new book to add it to your collection.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="The Great Gatsby" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="F. Scott Fitzgerald" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN</FormLabel>
                    <FormControl>
                      <Input placeholder="9780743273565" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => setAiDialogOpen(true)}>
                  <BrainCircuit className="mr-2" />
                  Generate with AI
                </Button>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Book
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAiDialogOpen} onOpenChange={setAiDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Book Data with AI</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a book title and let AI find the author and ISBN for you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ai-book-title">Book Title</Label>
            <Input 
              id="ai-book-title"
              placeholder="e.g., The Hobbit"
              value={aiBookTitle}
              onChange={(e) => setAiBookTitle(e.target.value)}
              disabled={aiLoading}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={aiLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAiPopulate} disabled={aiLoading || !aiBookTitle}>
              {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
