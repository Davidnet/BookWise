
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Book, BookStatus } from '@/lib/types';
import { BOOK_STATUSES } from '@/lib/types';
import { getBooks, addBook, updateBook, deleteBook } from '@/services/book-service';
import { BookCard } from '@/components/book-card';
import { AddBookDialog } from '@/components/add-book-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { UserNav } from '@/components/user-nav';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'All'>('All');

  const fetchBooks = useCallback(async () => {
    if (authLoading || !user) return;
    try {
      setLoading(true);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddBook = async (newBookData: Omit<Book, 'id' | 'status' | 'likes' | 'dislikes' | 'notes'>) => {
    const newBook: Omit<Book, 'id'> = { ...newBookData, status: 'Available', likes: 0, dislikes: 0, notes: '' };
    const addedBook = await addBook(newBook);
    setBooks(prev => [...prev, addedBook]);
  };

  const handleUpdateBook = async (updatedBook: Book) => {
    await updateBook(updatedBook);
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteBook(bookId);
    setBooks(prev => prev.filter(book => book.id !== bookId));
  };

  const filteredBooks = useMemo(() => {
    return books
      .filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(book => statusFilter === 'All' || book.status === statusFilter)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, searchTerm, statusFilter]);
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold font-headline tracking-tight">BookWise</h1>
        </div>
        <div className="flex items-center gap-4">
          <AddBookDialog onBookAdd={handleAddBook}>
            <Button>
              <PlusCircle className="mr-2" />
              Add New Book
            </Button>
          </AddBookDialog>
          {user && <UserNav />}
        </div>
      </header>

      <div className="mb-8 p-4 bg-card rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as BookStatus | 'All')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {BOOK_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <main>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onUpdate={handleUpdateBook} 
                onDelete={handleDeleteBook} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground text-lg">No books found.</p>
            <p className="text-muted-foreground">Try adding a new book to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
