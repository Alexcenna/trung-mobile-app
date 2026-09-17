import {
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export async function createConversation(userId, documentId, documentName) {
  const ref = await addDoc(collection(db, 'conversations'), {
    userId, documentId, documentName, createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToConversations(userId, callback) {
  const q = query(collection(db, 'conversations'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(conversationId, role, text) {
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    role, text, createdAt: serverTimestamp(),
  });
}