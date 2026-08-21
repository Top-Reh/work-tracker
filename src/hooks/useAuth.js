import { useAuthContext } from '@/context/AuthContext';

/** Exposes the current Firebase user + Firestore profile + loading flags. */
export function useAuth() {
  return useAuthContext();
}
