'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export async function uploadImage(imageDataUri: string, bookId: string): Promise<string> {
  const imageRef = ref(storage, `covers/${bookId}.png`);
  
  // The data URI needs to be stripped of its prefix before uploading
  const base64Data = imageDataUri.split(',')[1];

  try {
    const snapshot = await uploadString(imageRef, base64Data, 'base64', {
        contentType: 'image/png'
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image to Firebase Storage.");
  }
}
