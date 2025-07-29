import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged as onFirebaseAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return onFirebaseAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
        const unsubscribe = onFirebaseAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}
