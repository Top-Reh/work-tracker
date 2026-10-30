import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  deleteUser,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export class AuthError extends Error {}

/**
 * Thrown when Google sign-in finds an existing account for the same email under a different
 * sign-in method (e.g. email + password). Carries what's needed to link Google to that
 * account after the user proves they own it, instead of creating a duplicate.
 */
export class AccountLinkRequiredError extends AuthError {
  constructor(email, pendingCredential) {
    super('An account with this email already exists.');
    this.email = email;
    this.pendingCredential = pendingCredential;
  }
}

const EMAIL_STORAGE_KEY = 'emailForSignIn';

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
    'auth/invalid-phone-number': 'Please enter a valid phone number, e.g. 010 1234 5678.',
    'auth/invalid-verification-code': 'That verification code is incorrect.',
    'auth/code-expired': 'That verification code has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used. Please request a new one.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/provider-already-linked': 'This sign-in method is already connected to your account.',
    'auth/credential-already-in-use': 'That account is already connected to a different user.',
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

/**
 * Step 1 of registration: sends a sign-in link to the given email. No account exists
 * yet — Firebase only creates one once this exact link is opened and confirmed via
 * completeEmailLinkSignIn. The email is cached locally so the same browser/tab can
 * finish automatically if the link is opened there.
 */
export async function sendRegistrationLink(email) {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}${import.meta.env.BASE_URL}`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/** True if the current URL is a sign-in link Firebase just sent (i.e. the user clicked it). */
export function isEmailLinkSignIn() {
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Step 2 of registration: completes sign-in for the link in the current URL. This is
 * the moment the Firebase Auth account actually gets created — nothing exists before
 * this succeeds. The email must match what the link was originally sent to.
 */
export async function completeEmailLinkSignIn(email) {
  try {
    const credential = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
    return credential.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/**
 * Step 3 of registration: the user is already signed in (via the verified link) but has
 * no profile yet. This sets their name, a password (so they can also log in the normal
 * way next time), their salary defaults, and creates the Firestore profile doc.
 */
export async function completeProfileSetup({ name, password, hourlyRate, taxRate }) {
  if (!auth.currentUser) throw new AuthError('You must be signed in to do this.');
  try {
    await updateProfile(auth.currentUser, { displayName: name });
    await updatePassword(auth.currentUser, password);
    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      name,
      email: auth.currentUser.email || '',
      hourlyRate,
      taxRate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
      throw new AuthError('Incorrect email or password. If you signed in with Google using this email, tap "Continue with Google" instead.');
    }
    throw friendlyAuthError(error);
  }
}

export async function signInWithGoogle() {
  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    await ensureUserProfile(credential.user);
    return credential.user;
  } catch (error) {
    if (error?.code === 'auth/account-exists-with-different-credential') {
      const pendingCredential = GoogleAuthProvider.credentialFromError(error);
      const email = error.customData?.email;
      if (pendingCredential && email) throw new AccountLinkRequiredError(email, pendingCredential);
    }
    throw friendlyAuthError(error);
  }
}

/**
 * Finishes linking Google to an existing email + password account. The user signs in with
 * their current password (which is left untouched), then Google is attached to that same
 * account — same user, same data, and both sign-in methods work afterwards.
 */
export async function linkGoogleToPasswordAccount(email, password, pendingCredential) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await linkWithCredential(result.user, pendingCredential);
    return result.user;
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/**
 * Adds email + password sign-in to the signed-in user (who already has an email, e.g. via
 * Google). Uses account linking, so it never creates a second account.
 */
export async function addPasswordToAccount(password) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new AuthError('Add an email to your account before setting a password.');
  try {
    await linkWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/**
 * Sets up the invisible reCAPTCHA required by phone auth. Must be called once,
 * with an element id that exists in the DOM (e.g. a hidden <div id="recaptcha-container" />).
 */
export function setupRecaptcha(containerId) {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // Old verifier's container may already be gone from the DOM — safe to ignore.
    }
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
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

export async function resendVerificationEmail() {
  if (!auth.currentUser) throw new AuthError('You must be signed in to do this.');
  try {
    await sendEmailVerification(auth.currentUser);
  } catch (error) {
    throw friendlyAuthError(error);
  }
}

/**
 * Adds or changes the signed-in user's email. This does NOT take effect immediately —
 * Firebase sends a confirmation link to the new address, and the account's email only
 * actually updates once that link is clicked. This is what protects against typos or
 * fake addresses: an unclicked link just quietly never takes effect.
 */
export async function changeEmail(newEmail) {
  if (!auth.currentUser) throw new AuthError('You must be signed in to do this.');
  try {
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
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

/**
 * Changes the password for a user who signs in with email + password. The current password is
 * re-checked first (Firebase requires a recent sign-in for this), so a stranger on an unlocked
 * phone can't change it, and the user never gets bounced out by a "sign in again" error.
 */
export async function changePasswordWithCurrent(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new AuthError('You must be signed in to do this.');
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
  } catch (error) {
    if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password') {
      throw new AuthError('Your current password is incorrect.');
    }
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
