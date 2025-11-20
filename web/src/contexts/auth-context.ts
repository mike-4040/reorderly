/**
 * Authentication context definition
 */

import { User } from 'firebase/auth';
import { createContext } from 'react';

/**
 * Auth context value type
 */
export interface AuthContextValue {
  user: User | null;
  isLoadingAuthState: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithCustomToken: (token: string) => Promise<void>;
}

/**
 * Auth context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
