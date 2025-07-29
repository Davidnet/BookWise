export const BOOK_STATUSES = ['Available', 'Checked Out', 'Archived'] as const;
export type BookStatus = typeof BOOK_STATUSES[number];

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  borrower?: string;
  checkoutDate?: string;
  coverImageUrl?: string;
  likes: number;
  dislikes: number;
  notes?: string;
};
