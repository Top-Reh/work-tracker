import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { calculateRecord, calculateMonthlySummary } from '@/utils/salaryCalculations';

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

/** Deterministic doc id per date, so a user can only ever have one day-record per date. */
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

/**
 * Builds a single time-entry object (with its own gross/tax/net calculated) from raw
 * form input. `id` is reused when editing an existing entry, or generated fresh for a new one.
 */
export function buildEntry(id, input) {
  const calc = calculateRecord(input.hours, input.minutes, input.hourlyRate, input.taxRate);
  return {
    id,
    hours: input.hours,
    minutes: input.minutes,
    totalHours: calc.totalHours,
    hourlyRate: input.hourlyRate,
    grossSalary: calc.grossSalary,
    taxRate: input.taxRate,
    taxAmount: calc.taxAmount,
    netSalary: calc.netSalary,
    note: input.note ?? '',
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
  };
}

/**
 * Writes a day's full list of time entries, along with the day's aggregate totals
 * (the sum of every entry — this is what the calendar stamp and monthly summary read).
 */
export async function saveDayEntries(uid, date, entries) {
  try {
    const totals = calculateMonthlySummary(entries); // sums totalHours/grossSalary/taxAmount/netSalary across entries
    const ref = doc(db, 'users', uid, 'workRecords', recordDocId(date));
    await setDoc(
      ref,
      {
        date,
        entries,
        totalHours: totals.totalHours,
        grossSalary: totals.grossSalary,
        taxAmount: totals.taxAmount,
        netSalary: totals.netSalary,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}

export async function deleteDayRecord(uid, date) {
  try {
    await deleteDoc(doc(db, 'users', uid, 'workRecords', recordDocId(date)));
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}

/**
 * Recalculates every entry inside every given day-record with a new hourly rate / tax
 * rate (hours & minutes stay the same) and writes them all in a single atomic batch.
 * Used when a user changes the rate for an entire month via the month-rate bar.
 */
export async function recalculateRecordsWithNewRates(uid, records, hourlyRate, taxRate) {
  try {
    const batch = writeBatch(db);
    records.forEach((record) => {
      const newEntries = (record.entries ?? []).map((entry) => {
        const calc = calculateRecord(entry.hours, entry.minutes, hourlyRate, taxRate);
        return { ...entry, hourlyRate, taxRate, grossSalary: calc.grossSalary, taxAmount: calc.taxAmount, netSalary: calc.netSalary };
      });
      const totals = calculateMonthlySummary(newEntries);
      const ref = doc(db, 'users', uid, 'workRecords', record.id);
      batch.update(ref, {
        entries: newEntries,
        totalHours: totals.totalHours,
        grossSalary: totals.grossSalary,
        taxAmount: totals.taxAmount,
        netSalary: totals.netSalary,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (error) {
    throw friendlyFirestoreError(error);
  }
}
