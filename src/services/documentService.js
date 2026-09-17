import {
  collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const docsRef = collection(db, 'documents');

export function subscribeToDocuments(userId, callback) {
  const q = query(docsRef, where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addDocument(userId, { name, type, size, subject, base64Content }) {
  await addDoc(docsRef, {
    userId,
    name,
    type,
    size,
    subject: subject || 'Chưa phân loại',
    createdAt: serverTimestamp(),
    base64Content: base64Content || '',
  });
}

export async function renameDocument(docId, newName) {
  await updateDoc(doc(db, 'documents', docId), { name: newName });
}

export async function deleteDocument(docId) {
  await deleteDoc(doc(db, 'documents', docId));
}