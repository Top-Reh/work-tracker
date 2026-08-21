import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export class AuthError extends Error {}

/** Maps raw Firebase error codes to friendly, user-facing messages. Never leaks internal codes. */
function friendlyAuthError(error) {
  const code = error?.code ?? '';
  const messages = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };
  return new AuthError(messages[code] ?? 'Something went wrong. Please try again.');
}

export async function registerUser(name, email, password, hourlyRate, taxRate) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email,
      hourlyRate,
      taxRate,
      theme: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return credential.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function logoutUser() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function changePassword(newPassword) {
  if (!auth.currentUser) throw new AuthError('You must be signed in to do this.');
  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function deleteAccount() {
  if (!auth.currentUser) throw new AuthError('You must be signed in to do this.');
  try {
    await deleteUser(auth.currentUser);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}
