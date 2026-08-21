import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { calculateRecord } from '@/utils/salaryCalculations';

export class WorkRecordError extends Error {}

function friendlyFirestoreError(error) {
  const code = error?.code ?? '';
  const messages = {
    'permission-denied': "You don't have permission to do that.",
    unavailable: 'Connection lost. Please check your network and try again.',
    'deadline-exceeded': 'The request timed out. Please try again.',
  };
  return new WorkRecordError(messages[code] ?? 'Could not save your changes. Please try again.');
}

function recordsCollection(uid) {
  return collection(db, 'users', uid, 'workRecords');
}

/** Deterministic doc id per date, so a user can only ever have one record per day. */
function recordDocId(dateKey) {
  return dateKey;
}

export function subscribeToMonthRecords(uid, year, month, onChange, onError) {
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const q = query(recordsCollection(uid), where('date', '>=', monthStart), where('date', '<=', monthEnd));

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.date.localeCompare(b.date));
      onChange(records);
    },
    (error) => onError(friendlyFirestoreError(error))
  );
}

export function subscribeToYearRecords(uid, year, onChange, onError) {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const q = query(recordsCollection(uid), where('date', '>=', yearStart), where('date', '<=', yearEnd));

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.date.localeCompare(b.date));
      onChange(records);
    },
    (error) => onError(friendlyFirestoreError(error))
  );
}

export async function saveWorkRecord(uid, input) {
  try {
    const calc = calculateRecord(input.hours, input.minutes, input.hourlyRate, input.taxRate);
    const id = recordDocId(input.date);
    const ref = doc(db, 'users', uid, 'workRecords', id);

    await setDoc(
      ref,
      {
        date: input.date,
        hours: input.hours,
        minutes: input.minutes,
        totalHours: calc.totalHours,
        hourlyRate: input.hourlyRate,
        grossSalary: calc.grossSalary,
        taxRate: input.taxRate,
        taxAmount: calc.taxAmount,
        netSalary: calc.netSalary,
        note: input.note ?? '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}

export async function updateWorkRecord(uid, recordId, input) {
  try {
    const calc = calculateRecord(input.hours, input.minutes, input.hourlyRate, input.taxRate);
    const ref = doc(db, 'users', uid, 'workRecords', recordId);
    await updateDoc(ref, {
      hours: input.hours,
      minutes: input.minutes,
      totalHours: calc.totalHours,
      hourlyRate: input.hourlyRate,
      grossSalary: calc.grossSalary,
      taxRate: input.taxRate,
      taxAmount: calc.taxAmount,
      netSalary: calc.netSalary,
      note: input.note ?? '',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}

export async function deleteWorkRecord(uid, recordId) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'workRecords', recordId));
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}
