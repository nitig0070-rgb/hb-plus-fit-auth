import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  AuthResult,
} from '../services/authService';
import {
  getProfile,
  ensureProfileExists,
  UserProfile,
  UserRole,
} from '../services/profileService';
import {
  isAuthorizedDomain,
  DOMAIN_RESTRICTION_ERROR_MESSAGE,
} from '../utils/domainValidator';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  setError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Loads or creates user profile from the Supabase database
   */
  const loadProfile = useCallback(async (currentUser: User) => {
    try {
      if (!currentUser?.email) return;

      // 1. Try to fetch existing profile
      const { profile: existingProfile } = await getProfile(currentUser.id);

      if (existingProfile) {
        setProfile(existingProfile);
        setRole(existingProfile.role);
        return;
      }

      // 2. If not found, provision it using ensureProfileExists
      const created = await ensureProfileExists({
        id: currentUser.id,
        email: currentUser.email,
        user_metadata: currentUser.user_metadata,
      });

      if (created) {
        setProfile(created);
        setRole(created.role);
      } else {
        // Fallback profile representation if DB table is initializing
        const fallbackRole: UserRole =
          currentUser.email.toLowerCase() === 'admin@hbplus.fit' ? 'admin' : 'user';
        setRole(fallbackRole);
        setProfile({
          id: currentUser.id,
          email: currentUser.email,
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email.split('@')[0],
          avatar_url:
            currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture ||
            null,
          role: fallbackRole,
          department: 'Corporate Headquarters',
          last_sign_in_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  /**
   * Initializes session and verifies domain restriction on boot
   */
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        setIsLoading(true);

        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('Get session error:', sessionError.message);
        }

        if (initialSession && initialSession.user) {
          const userEmail = initialSession.user.email;

          // STRICT DOMAIN RESTRICTION CHECK
          if (!isAuthorizedDomain(userEmail)) {
            await supabase.auth.signOut();
            if (mounted) {
              setSession(null);
              setUser(null);
              setProfile(null);
              setError(DOMAIN_RESTRICTION_ERROR_MESSAGE);
            }
          } else {
            if (mounted) {
              setSession(initialSession);
              setUser(initialSession.user);
              await loadProfile(initialSession.user);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to real-time authentication events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole('user');
        setIsLoading(false);
        return;
      }

      const email = currentSession?.user?.email;

      // STRICT DOMAIN RESTRICTION CHECK
      if (!isAuthorizedDomain(email)) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole('user');
        setError(DOMAIN_RESTRICTION_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession.user);
      await loadProfile(currentSession.user);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await authSignInWithGoogle();

      if (!res.success && res.error) {
        setError(res.error);
      }

      return res;
    } catch (err: any) {
      const message = err?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole('user');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isLoading,
        error,
        signInWithGoogle,
        signOut: handleSignOut,
        refreshProfile,
        clearError,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
