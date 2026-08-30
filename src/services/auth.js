import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    'auth/invalid-phone-number': 'Please enter a valid phone number, including country code (e.g. +82…).',
    'auth/invalid-verification-code': 'That verification code is incorrect.',
    'auth/code-expired': 'That verification code has expired. Please request a new one.',
  };
  return new AuthError(messages[code] ?? 'Something went wrong. Please try again.');
}

/** Creates the Firestore profile doc for a brand-new user, if one doesn't already exist. */
async function ensureUserProfile(user, fallbackName) {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    name: user.displayName || fallbackName || 'New User',
    email: user.email || '',
    phone: user.phoneNumber || '',
    hourlyRate: 10000,
    taxRate: 3.3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

export async function signInWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function signInWithFacebook() {
  try {
    const credential = await signInWithPopup(auth, new FacebookAuthProvider());
    await ensureUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/**
 * Sets up the invisible reCAPTCHA required by phone auth. Must be called once,
 * with an element id that exists in the DOM (e.g. a hidden <div id="recaptcha-container" />).
 */
export function setupRecaptcha(containerId) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  }
  return window.recaptchaVerifier;
}

/** Sends an SMS verification code and returns a confirmation handle to pass to confirmPhoneCode. */
export async function sendPhoneVerificationCode(phoneNumber) {
  try {
    const verifier = setupRecaptcha('recaptcha-container');
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/** Completes phone sign-in given the confirmation handle from sendPhoneVerificationCode and the SMS code. */
export async function confirmPhoneCode(confirmationResult, code) {
  try {
    const credential = await confirmationResult.confirm(code);
    await ensureUserProfile(credential.user, credential.user.phoneNumber);
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
