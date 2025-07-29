
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { ai } from './ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { FieldValue } from 'firebase-admin/firestore';
import { Change } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';

admin.initializeApp();

const db = admin.firestore();

export const onBookWriteCreateEmbedding = functions.firestore
  .document('/users/{userId}/books/{bookId}')
  .onWrite(
    async (
      change: Change<DocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const bookData = change.after.data();
      const previousBookData = change.before.data();

      if (!bookData || bookData.notes === previousBookData?.notes) {
        console.log('No change in notes, skipping embedding generation.');
        return null;
      }
      const notes = bookData.notes;
      if (!notes) {
        console.log('No notes found in the document, skipping.');
        return null;
      }

      try {
        const embeddings = await ai.embed({
          embedder: googleAI.embedder('gemini-embedding-001', {
            outputDimensionality: 768,
          }),
          content: notes,
        });

        const embedding = embeddings[0];
        const vector = 'embedding' in embedding ? embedding.embedding : embedding;

        const vectorEmbedding = FieldValue.vector(vector);

        return db
          .collection('users')
          .doc(context.params.userId)
          .collection('books')
          .doc(context.params.bookId)
          .update({
            embedding: vectorEmbedding,
          });
      } catch (e) {
        console.error('Error generating embeddings or updating document', e);
        return null;
      }
    }
  );
