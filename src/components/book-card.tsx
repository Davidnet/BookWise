"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { Book, BookStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Archive, ArrowUpRightFromSquare, BookCheck, BrainCircuit, Gift, Image as ImageIcon, MessageSquare, MoreVertical, Notebook, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AssignBorrowerDialog } from './assign-borrower-dialog';
import { RelatedBooksDialog } from './related-books-dialog';
import { GenerateCoverDialog } from './generate-cover-dialog';
import { formatDistanceToNow } from 'date-fns';
import { donateBook } from '@/services/book-service';
import { TalkWithGeminiDialog } from './talk-with-gemini-dialog';
import { WriteNotesDialog } from './write-notes-dialog';

interface BookCardProps {
  book: Book;
  onUpdate: (book: Book) => Promise<void>;
  onDelete: (bookId: string) => Promise<void>;
}

export function BookCard({ book, onUpdate, onDelete }: BookCardProps) {
  const { toast } = useToast();
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isRelatedDialogOpen, setRelatedDialogOpen] = useState(false);
  const [isCoverDialogOpen, setCoverDialogOpen] = useState(false);
  const [isTalkDialogOpen, setTalkDialogOpen] = useState(false);
  const [isNotesDialogOpen, setNotesDialogOpen] = useState(false);

  const handleStatusChange = async (status: 'Available' | 'Archived') => {
    try {
      await onUpdate({ ...book, status, borrower: undefined, checkoutDate: undefined });
      toast({
        title: "Status Updated",
        description: `"${book.title}" is now ${status.toLowerCase()}.`,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleCheckout = async (borrower: string) => {
    try {
      await onUpdate({ ...book, status: 'Checked Out', borrower, checkoutDate: new Date().toISOString() });
      toast({
        title: "Book Checked Out",
        description: `"${book.title}" has been checked out to ${borrower}.`,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to check out book.' });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(book.id);
      toast({
        title: "Book Deleted",
        description: `"${book.title}" has been removed from the library.`,
        variant: 'destructive',
      });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete book.' });
    }
  };
  
  const handleCoverGenerated = (coverImageUrl: string) => {
    onUpdate({ ...book, coverImageUrl });
  };

  const handleDonate = async () => {
    try {
      await donateBook(book);
      toast({
        title: "Book Donated",
        description: `Thank you for donating "${book.title}"!`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to donate book. It might already have been donated.',
      });
    }
  };

  const handleLike = () => {
    onUpdate({ ...book, likes: (book.likes ?? 0) + 1 });
  };

  const handleDislike = () => {
    onUpdate({ ...book, dislikes: (book.dislikes ?? 0) + 1 });
  };

  const handleSaveNotes = async (notes: string) => {
    try {
      await onUpdate({ ...book, notes });
      toast({
        title: "Notes Saved",
        description: `Your notes for "${book.title}" have been saved.`,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save notes.' });
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full transition-all hover:shadow-lg">
        {book.coverImageUrl ? (
          <div className="relative aspect-[2/3] w-full">
            <Image src={book.coverImageUrl} alt={`${book.title} cover`} fill className="object-cover rounded-t-lg" />
          </div>
        ) : (
          <div className="relative aspect-[2/3] w-full bg-secondary rounded-t-lg flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="pr-2">{book.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('Available')} disabled={book.status === 'Available'}>
                  <BookCheck className="mr-2 h-4 w-4" />
                  <span>Mark as Available</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignDialogOpen(true)} disabled={book.status === 'Checked Out'}>
                  <ArrowUpRightFromSquare className="mr-2 h-4 w-4" />
                  <span>Check Out</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Archived')} disabled={book.status === 'Archived'}>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRelatedDialogOpen(true)}>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  <span>Suggest Related</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCoverDialogOpen(true)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Generate Cover</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTalkDialogOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Talk with Gemini</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotesDialogOpen(true)}>
                  <Notebook className="mr-2 h-4 w-4" />
                  <span>Write Notes</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleDonate}>
                  <Gift className="mr-2 h-4 w-4" />
                  <span>Donate to public library</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{book.title}" from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>by {book.author}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-4">
             <Badge
              variant="outline"
              className={cn("font-medium", {
                'bg-primary/10 text-primary border-primary/20': book.status === 'Available',
                'bg-accent/10 text-accent-foreground border-accent/20': book.status === 'Checked Out',
                'bg-muted text-muted-foreground border-transparent': book.status === 'Archived',
              })}
            >
              {book.status}
            </Badge>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLike}>
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span>{book.likes ?? 0}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDislike}>
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <span>{book.dislikes ?? 0}</span>
            </div>
          </div>
          {book.status === 'Checked Out' && book.borrower && (
            <div className="text-sm text-muted-foreground">
              <p>To: <strong>{book.borrower}</strong></p>
              {book.checkoutDate && <p>{formatDistanceToNow(new Date(book.checkoutDate), { addSuffix: true })}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
        </CardFooter>
      </Card>

      <AssignBorrowerDialog 
        book={book}
        isOpen={isAssignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleCheckout}
      />
      <RelatedBooksDialog
        bookTitle={book.title}
        isOpen={isRelatedDialogOpen}
        onOpenChange={setRelatedDialogOpen}
      />
      <GenerateCoverDialog
        book={book}
        isOpen={isCoverDialogOpen}
        onOpenChange={setCoverDialogOpen}
        onCoverGenerated={handleCoverGenerated}
      />
      <TalkWithGeminiDialog
        book={book}
        isOpen={isTalkDialogOpen}
        onOpenChange={setTalkDialogOpen}
      />
      <WriteNotesDialog
        book={book}
        isOpen={isNotesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        onSave={handleSaveNotes}
      />
    </>
  );
}
