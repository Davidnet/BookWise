import { db } from '@/lib/firebase';
import { Book } from '@/lib/types';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, setDoc } from 'firebase/firestore';
import { getCurrentUser } from './auth-service';

function getBooksCollection(userId: string) {
    return collection(db, 'users', userId, 'books');
}

const publicBooksCollection = collection(db, 'public-books');

const initialBooks: Omit<Book, 'id'>[] = [
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'Available', likes: 0, dislikes: 0, notes: '' },
    { title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'Available', likes: 0, dislikes: 0, notes: '' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'Available', likes: 0, dislikes: 0, notes: '' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', status: 'Available', likes: 0, dislikes: 0, notes: '' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', status: 'Available', likes: 0, dislikes: 0, notes: '' },
];

async function seedInitialBooks(userId: string) {
    const booksCollection = getBooksCollection(userId);
    const batch = writeBatch(db);

    // Add hardcoded initial books
    initialBooks.forEach(book => {
        const docRef = doc(booksCollection);
        batch.set(docRef, book);
    });

    // Add books from the public collection
    const publicBooksSnapshot = await getDocs(publicBooksCollection);
    publicBooksSnapshot.forEach(publicBookDoc => {
        const publicBookData = publicBookDoc.data();
        const newBook: Omit<Book, 'id'> = {
            title: publicBookData.title,
            author: publicBookData.author,
            isbn: publicBookData.isbn,
            status: 'Available',
            likes: 0,
            dislikes: 0,
            notes: '',
        };
        const docRef = doc(booksCollection);
        batch.set(docRef, newBook);
    });
    
    await batch.commit();
}

export async function getBooks(): Promise<Book[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const booksCollection = getBooksCollection(user.uid);
    const querySnapshot = await getDocs(booksCollection);
    
    if (querySnapshot.empty) {
        await seedInitialBooks(user.uid);
        const seededSnapshot = await getDocs(booksCollection);
        return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
    }
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
}

export async function addBook(book: Omit<Book, 'id'>): Promise<Book> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    const booksCollection = getBooksCollection(user.uid);
    const bookWithLikes = { ...book, likes: 0, dislikes: 0, notes: '' };
    const docRef = await addDoc(booksCollection, bookWithLikes);
    return { id: docRef.id, ...bookWithLikes };
}

export async function updateBook(book: Book): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const { id, ...bookData } = book;
    const bookDoc = doc(db, 'users', user.uid, 'books', id);
    await updateDoc(bookDoc, bookData);
}

export async function deleteBook(bookId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const bookDoc = doc(db, 'users', user.uid, 'books', bookId);
    await deleteDoc(bookDoc);
}

export async function donateBook(book: Book): Promise<void> {
    const { id, ...bookData } = book;
    const publicBookDocRef = doc(publicBooksCollection, id);
    
    // Reset status to available for the public version
    const bookToDonate = { 
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        status: 'Available', 
        likes: 0, 
        dislikes: 0,
        notes: '',
    };
    
    await setDoc(publicBookDocRef, bookToDonate);
}
