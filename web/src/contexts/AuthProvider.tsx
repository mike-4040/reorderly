/**
 * Authentication provider
 * Manages Firebase auth state
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { useEffect, useState, ReactNode } from 'react';

import { auth } from '../firebase/config';

import { AuthContext, AuthContextValue } from './auth-context';

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuthState, setIsLoadingAuthState] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoadingAuthState(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error('signIn_failed', { cause: error });
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error('signUp_failed', { cause: error });
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error('signOut_failed', { cause: error });
    }
  };

  const signInWithCustomToken = async (token: string): Promise<void> => {
    try {
      await firebaseSignInWithCustomToken(auth, token);
    } catch (error) {
      throw new Error('signInWithCustomToken_failed', { cause: error });
    }
  };

  const value: AuthContextValue = {
    user,
    isLoadingAuthState,
    signIn,
    signUp,
    signOut,
    signInWithCustomToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
