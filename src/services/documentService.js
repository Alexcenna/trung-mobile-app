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

export async function updateDocumentSubject(docId, newSubject) {
  await updateDoc(doc(db, 'documents', docId), { subject: newSubject });
}

export async function addDocument(userId, { name, type, size, subject, base64Content, textContent }) {
  await addDoc(docsRef, {
    userId,
    name,
    type,
    size,
    subject: subject || 'Chưa phân loại',
    createdAt: serverTimestamp(),
    base64Content: base64Content || '',
    textContent: textContent || '',
  });
}

export async function renameDocument(docId, newName) {
  await updateDoc(doc(db, 'documents', docId), { name: newName });
}

export async function deleteDocument(docId) {
  await deleteDoc(doc(db, 'documents', docId));
}