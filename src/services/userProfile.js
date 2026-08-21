import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export class ProfileError extends Error {}

function friendlyError(error) {
  const code = error?.code ?? '';
  const messages = {
    'permission-denied': "You don't have permission to do that.",
    unavailable: 'Connection lost. Please check your network and try again.',
  };
  return new ProfileError(messages[code] ?? 'Could not save your changes. Please try again.');
}

export function subscribeToProfile(uid, onChange, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => onChange(snapshot.exists() ? snapshot.data() : null),
    (error) => onError(friendlyError(error))
  );
}

export async function updateProfileSettings(uid, updates) {
  try {
    await updateDoc(doc(db, 'users', uid), { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    throw friendlyError(error);
  }
}
