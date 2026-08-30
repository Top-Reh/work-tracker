import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export class MonthSettingsError extends Error {}

function friendlyError(error) {
  const code = error?.code ?? '';
  const messages = {
    'permission-denied': "You don't have permission to do that.",
    unavailable: 'Connection lost. Please check your network and try again.',
  };
  return new MonthSettingsError(messages[code] ?? 'Could not save your changes. Please try again.');
}

/** Doc id like "2026-08" — one settings doc per calendar month, scoped to that month only. */
function monthDocId(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function subscribeToMonthSettings(uid, year, month, onChange, onError) {
  const ref = doc(db, 'users', uid, 'monthSettings', monthDocId(year, month));
  return onSnapshot(
    ref,
    (snapshot) => onChange(snapshot.exists() ? snapshot.data() : null),
    (error) => onError(friendlyError(error))
  );
}

export async function setMonthSettings(uid, year, month, hourlyRate, taxRate) {
  try {
    const ref = doc(db, 'users', uid, 'monthSettings', monthDocId(year, month));
    await setDoc(ref, { hourlyRate, taxRate, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    throw friendlyError(error);
  }
}
